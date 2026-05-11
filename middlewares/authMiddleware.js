/**
 * Middleware para verificar se o usuário está logado
 */
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.tokens) {
        return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
    }
    next();
};

/**
 * Middleware para verificar se o usuário logado possui perfil de Admin
 */
const requireAdmin = (req, res, next) => {
    // Primeiro garante que está logado
    if (!req.session || !req.session.tokens) {
        return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
    }

    // Verifica a role na sessão (que será definida após a leitura da planilha no callback)
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
    }

    next();
};

module.exports = {
    requireAuth,
    requireAdmin
};
