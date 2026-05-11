const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * Gera a URL de autenticação do Google
 * @param {string[]} scopes Escopos solicitados
 * @returns {string} URL de autorização
 */
const getAuthUrl = (scopes) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    });
};

/**
 * Troca o código de autorização por tokens
 * @param {string} code Código retornado pelo Google
 * @returns {Promise<object>} Tokens (access_token, refresh_token, etc)
 */
const getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

/**
 * Cria um cliente autenticado com os tokens fornecidos
 * @param {object} tokens Tokens de acesso/refresh
 * @returns {object} Cliente OAuth2 configurado
 */
const getAuthenticatedClient = (tokens) => {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    client.setCredentials(tokens);
    return client;
};

module.exports = {
    getAuthUrl,
    getTokens,
    getAuthenticatedClient,
    oauth2Client
};
