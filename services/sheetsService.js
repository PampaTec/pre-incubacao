const { google } = require('googleapis');

/**
 * Função utilitária para obter a instância da API do Sheets
 */
const getSheetsApi = (auth) => google.sheets({ version: 'v4', auth });

/**
 * Registra um novo time na aba "TIMES"
 * Colunas esperadas: [ID_TIME, NOME_STARTUP, EMAILS_MEMBROS, DATA_CRIACAO, PASTA_DRIVE_ID, DOC_BMC_ID]
 */
const registrarTime = async (auth, spreadsheetId, dados) => {
    const sheets = getSheetsApi(auth);
    
    // Converte os dados no formato esperado pela API (array de arrays)
    const values = [
        [
            dados.idTime, 
            dados.nomeStartup, 
            dados.emailsMembros, 
            new Date().toISOString(), 
            dados.pastaDriveId, 
            dados.docBmcId
        ]
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'TIMES!A:F', // Aba "TIMES" e colunas de A a F
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
        return true;
    } catch (err) {
        console.error('Erro ao registrar time na planilha:', err);
        throw err;
    }
};

/**
 * Lista todos os times cadastrados na aba "TIMES"
 */
const listarTimes = async (auth, spreadsheetId) => {
    const sheets = getSheetsApi(auth);
    
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'TIMES!A:F',
        });
        
        const rows = response.data.values || [];
        // Ignora a primeira linha se for cabeçalho
        if (rows.length > 0 && rows[0][0] === 'ID_TIME') {
            rows.shift();
        }
        
        // Mapeia para um array de objetos para facilitar o uso no frontend
        return rows.map(row => ({
            idTime: row[0],
            nomeStartup: row[1],
            emailsMembros: row[2],
            dataCriacao: row[3],
            pastaDriveId: row[4],
            docBmcId: row[5]
        }));
    } catch (err) {
        console.error('Erro ao listar times:', err);
        throw err;
    }
};

/**
 * Atualiza o progresso do time na aba "PROGRESSO"
 * Colunas: [ID_TIME, ETAPA_ATUAL, STATUS, TIMESTAMP, RESPOSTA_AGENTE]
 */
const atualizarProgresso = async (auth, spreadsheetId, idTime, etapa, status, resposta) => {
    const sheets = getSheetsApi(auth);
    
    const values = [
        [idTime, etapa, status, new Date().toISOString(), resposta]
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'PROGRESSO!A:E',
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
        return true;
    } catch (err) {
        console.error('Erro ao atualizar progresso:', err);
        throw err;
    }
};

/**
 * Salva uma nova mensagem do chat na aba "CHAT_HISTORICO"
 * Colunas: [ID_TIME, ROLE, CONTEUDO, TIMESTAMP]
 */
const salvarMensagemChat = async (auth, spreadsheetId, idTime, role, conteudo) => {
    const sheets = getSheetsApi(auth);
    
    const values = [
        [idTime, role, conteudo, new Date().toISOString()]
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'CHAT_HISTORICO!A:D',
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
        return true;
    } catch (err) {
        console.error('Erro ao salvar mensagem do chat:', err);
        throw err;
    }
};

/**
 * Carrega o histórico do chat de um time específico
 */
const carregarHistoricoChat = async (auth, spreadsheetId, idTime) => {
    const sheets = getSheetsApi(auth);
    
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'CHAT_HISTORICO!A:D',
        });
        
        const rows = response.data.values || [];
        
        // Filtra apenas as mensagens referentes a esse time e formata
        return rows
            .filter(row => row[0] === idTime)
            .map(row => ({
                role: row[1],
                conteudo: row[2],
                timestamp: row[3]
            }));
    } catch (err) {
        console.error('Erro ao carregar histórico do chat:', err);
        throw err;
    }
};

module.exports = {
    registrarTime,
    listarTimes,
    atualizarProgresso,
    salvarMensagemChat,
    carregarHistoricoChat
};
