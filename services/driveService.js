const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID;

function getDriveClient(tokens) {
  const auth = getAuthenticatedClient(tokens);
  return google.drive({ version: 'v3', auth });
}

async function criarPasta(nome, tokens, pastaPaiId = ROOT_FOLDER_ID) {
  const drive = getDriveClient(tokens);
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [pastaPaiId]
    },
    fields: 'id, name'
  });
  return res.data;
}

async function clonarArquivo(fileId, nome, pastaDestinoId, tokens) {
  const drive = getDriveClient(tokens);
  const res = await drive.files.copy({
    fileId,
    requestBody: {
      name,
      parents: [pastaDestinoId]
    },
    fields: 'id, name'
  });
  return res.data;
}

async function compartilharComUsuarios(fileId, emails, tokens, role = 'writer') {
  const drive = getDriveClient(tokens);
  const permissoes = [];
  for (const email of emails) {
    const res = await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email
      },
      fields: 'id'
    });
    permissoes.push(res.data);
  }
  return permissoes;
}

async function listarArquivosNaPasta(pastaId, tokens) {
  const drive = getDriveClient(tokens);
  const res = await drive.files.list({
    q: `'${pastaId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, createdTime)',
    orderBy: 'createdTime'
  });
  return res.data.files;
}

module.exports = {
  criarPasta,
  clonarArquivo,
  compartilharComUsuarios,
  listarArquivosNaPasta
};
