const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

const SHEET_ID = process.env.PROGRESS_SHEET_ID;

function getSheetsClient(tokens) {
  const auth = getAuthenticatedClient(tokens);
  return google.sheets({ version: 'v4', auth });
}

function normalizarChave(key) {
  return key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function montarObjeto(cabecalho, row) {
  const obj = {};
  cabecalho.forEach((key, i) => {
    obj[normalizarChave(key)] = row[i] || '';
  });
  return obj;
}

async function registrarTime(dados, tokens) {
  const sheets = getSheetsClient(tokens);
  const { id_time, nome_projeto, pasta_drive_id, doc_modelo_id, membros } = dados;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'TIMES!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id_time, nome_projeto, pasta_drive_id, doc_modelo_id, membros.join(', '), new Date().toISOString().split('T')[0]]]
    }
  });
}

async function listarTimes(tokens) {
  const sheets = getSheetsClient(tokens);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'TIMES!A:F'
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  const cabecalho = rows[0];
  return rows.slice(1).map(row => montarObjeto(cabecalho, row));
}

async function buscarTimePorId(id_time, tokens) {
  const times = await listarTimes(tokens);
  return times.find(t => t.id_time === id_time) || null;
}

async function atualizarProgresso(id_time, etapa, status, resposta, tokens) {
  const sheets = getSheetsClient(tokens);
  const dataConclusao = status === '✅ Concluído' ? new Date().toISOString().split('T')[0] : '-';
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'PROGRESSO_BMC!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id_time, etapa, status, dataConclusao, resposta || '-']]
    }
  });
}

async function carregarProgresso(id_time, tokens) {
  const sheets = getSheetsClient(tokens);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'PROGRESSO_BMC!A:E'
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  const cabecalho = rows[0];
  return rows.slice(1)
    .filter(row => row[0] === id_time)
    .map(row => montarObjeto(cabecalho, row));
}

async function salvarMensagemChat(id_time, role, conteudo, tokens) {
  const sheets = getSheetsClient(tokens);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'HISTORICO_CHAT!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id_time, new Date().toISOString(), role, conteudo]]
    }
  });
}

async function carregarHistoricoChat(id_time, tokens) {
  const sheets = getSheetsClient(tokens);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'HISTORICO_CHAT!A:D'
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  const cabecalho = rows[0];
  return rows.slice(1)
    .filter(row => row[0] === id_time)
    .map(row => montarObjeto(cabecalho, row));
}

async function registrarAuditoriaSkill(admin_email, secao_alterada, valor_anterior, valor_novo, tokens) {
  const sheets = getSheetsClient(tokens);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'HISTORICO_SKILL!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), admin_email, secao_alterada, valor_anterior, valor_novo]]
    }
  });
}

module.exports = {
  registrarTime,
  listarTimes,
  buscarTimePorId,
  atualizarProgresso,
  carregarProgresso,
  salvarMensagemChat,
  carregarHistoricoChat,
  registrarAuditoriaSkill
};
