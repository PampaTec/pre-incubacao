const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

function getGmailClient(tokens) {
  const auth = getAuthenticatedClient(tokens);
  return google.gmail({ version: 'v1', auth });
}

function criarMensagemBase64(para, assunto, corpoTexto) {
  const utf8Bytes = [
    `From: ${process.env.GMAIL_USER}`,
    `To: ${para}`,
    `Subject: =?UTF-8?B?${Buffer.from(assunto).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    corpoTexto
  ].join('\n');

  return Buffer.from(utf8Bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function enviarEmail(para, assunto, corpoTexto, tokens) {
  const gmail = getGmailClient(tokens);
  const raw = criarMensagemBase64(para, assunto, corpoTexto);
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });
}

async function notificarMembros(emails, nomeProjeto, linkSistema, tokens) {
  const assunto = `Você foi adicionado ao projeto ${nomeProjeto} - PampaTec Pré-Incubação`;
  const corpo = `Olá!\n\nVocê foi adicionado como membro do projeto "${nomeProjeto}" no Programa de Pré-Incubação PampaTec.\n\nAcesse o sistema em: ${linkSistema}\n\nFaça login com sua conta Google para começar.\n\nAtenciosamente,\nEquipe PampaTec`;

  for (const email of emails) {
    await enviarEmail(email.trim(), assunto, corpo, tokens);
  }
}

async function enviarEmailSuporte(para, assunto, corpoHtml, tokens) {
  const gmail = getGmailClient(tokens);
  const raw = Buffer.from(
    [
      `From: ${process.env.GMAIL_USER}`,
      `To: ${para}`,
      `Subject: =?UTF-8?B?${Buffer.from(assunto).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      corpoHtml
    ].join('\n')
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });
}

module.exports = {
  enviarEmail,
  notificarMembros,
  enviarEmailSuporte
};
