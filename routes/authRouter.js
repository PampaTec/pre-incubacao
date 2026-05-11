const express = require('express');
const { google } = require('googleapis');
const { getAuthUrl, getTokens, getAuthenticatedClient } = require('../services/googleAuth');

const router = express.Router();

// Escopos base para Empreendedores (Membros do time)
const SCOPES_MEMBER = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
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
    const url = getAuthUrl(SCOPES_MEMBER, 'user');
    res.redirect(url);
});

// Rota de login para Admins
router.get('/google/admin', (req, res) => {
    const url = getAuthUrl(SCOPES_ADMIN, 'admin');
    res.redirect(url);
});

// Callback do Google (usado por ambos)
router.get('/google/callback', async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
        return res.status(400).json({ error: 'Falha na autenticação', details: error });
    }

    try {
        const tokens = await getTokens(code);
        req.session.tokens = tokens;
        
        // Inicializa o cliente para buscar os dados do usuário
        const client = getAuthenticatedClient(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const userInfo = await oauth2.userinfo.get();
        const userEmail = userInfo.data.email;
        
        // LÓGICA DO SUPER ADMIN E VALIDAÇÃO DE PAPEL
        let role = 'user'; // Padrão de segurança
        
        // 1. Verifica se é o Super Admin lacrado no .env
        if (userEmail === process.env.ADMIN_EMAIL) {
            role = 'admin';
        } else if (state === 'admin') {
            // 2. Se tentou logar como admin mas não é o Super Admin, 
            // no futuro buscaremos na Planilha. Por enquanto, barra ou deixa passar (mock).
            // Vamos deixar como admin temporariamente para você poder testar outros emails, 
            // mas com um TODO claro.
            // TODO: Consultar aba TIMES/ADMINS na planilha para confirmar se userEmail é admin
            role = 'admin'; 
        }

        req.session.role = role;
        req.session.email = userEmail;

        // Redireciona para o frontend no lugar correto
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        const redirectPath = role === 'admin' ? '/dashboard' : '/time';
        
        res.redirect(`${frontendUrl}${redirectPath}`);
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
        res.json({ 
            authenticated: true, 
            role: req.session.role,
            email: req.session.email 
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;
