const express = require('express');
const { getAuthUrl, getTokens } = require('../services/googleAuth');

const router = express.Router();

// Escopos base para Empreendedores (Membros do time)
const SCOPES_MEMBER = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/generative-language'
];

// Escopos completos para Administradores
const SCOPES_ADMIN = [
    ...SCOPES_MEMBER,
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/gmail.send'
];

// Rota de login para Membros
router.get('/google', (req, res) => {
    const url = getAuthUrl(SCOPES_MEMBER);
    res.redirect(url);
});

// Rota de login para Admins
router.get('/google/admin', (req, res) => {
    const url = getAuthUrl(SCOPES_ADMIN);
    res.redirect(url);
});

// Callback do Google (usado por ambos)
router.get('/google/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).json({ error: 'Falha na autenticação', details: error });
    }

    try {
        const tokens = await getTokens(code);
        
        // Aqui no futuro faremos a validação de papel consultando a Planilha (aba TIMES).
        // Por enquanto, salvamos tudo na sessão temporária.
        
        req.session.tokens = tokens;
        
        // TODO: Decodificar o JWT do Google para pegar o e-mail e definir a role (admin/membro)
        req.session.role = 'user'; // Mock temporário

        // Redireciona para o frontend após login com sucesso
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        res.redirect(`${frontendUrl}/dashboard`);
    } catch (err) {
        console.error('Erro no callback OAuth:', err);
        res.status(500).json({ error: 'Erro ao processar tokens' });
    }
});

// Rota de logout
router.get('/logout', (req, res) => {
    req.session = null;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/`);
});

// Rota para o frontend checar o status atual
router.get('/status', (req, res) => {
    if (req.session && req.session.tokens) {
        res.json({ authenticated: true, role: req.session.role });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;
