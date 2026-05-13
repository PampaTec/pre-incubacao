const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

function getDocsClient(tokens) {
  const auth = getAuthenticatedClient(tokens);
  return google.docs({ version: 'v1', auth });
}

const ETAPA_MAP = {
  1: 'Proposta de Valor',
  2: 'Segmento de Clientes',
  3: 'Relacionamento com Clientes',
  4: 'Canais',
  5: 'Fontes de Receita',
  6: 'Parcerias Principais',
  7: 'Recursos Principais',
  8: 'Atividades-Chave',
  9: 'Estrutura de Custos'
};

async function atualizarSecaoEtapa(docId, etapa, texto, tokens) {
  const docs = getDocsClient(tokens);
  const nomeEtapa = ETAPA_MAP[etapa] || `Etapa ${etapa}`;

  const doc = await docs.documents.get({ documentId: docId });
  const content = doc.data.body.content;

  let targetIndex = -1;
  for (let i = 0; i < content.length; i++) {
    const elem = content[i];
    if (elem.paragraph && elem.paragraph.elements) {
      const text = elem.paragraph.elements.map(e => e.textRun?.content || '').join('').trim();
      if (text.includes(nomeEtapa)) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return null;

  const requests = [];
  let nextIndex = targetIndex + 1;
  while (nextIndex < content.length) {
    const elem = content[nextIndex];
    if (elem.paragraph && elem.paragraph.elements) {
      const text = elem.paragraph.elements.map(e => e.textRun?.content || '').join('').trim();
      if (text.startsWith('|') || text.includes('---') || text.includes('##')) break;
    }
    if (elem.table) break;
    const startIdx = elem.startIndex;
    const endIdx = elem.endIndex;
    if (endIdx > startIdx) {
      requests.push({ deleteContentRange: { range: { startIndex: startIdx, endIndex: endIdx } } });
    }
    nextIndex++;
  }

  const insertIdx = content[targetIndex].endIndex;
  requests.push({
    insertText: { location: { index: insertIdx }, text: `\n${texto}\n` }
  });

  if (requests.length > 0) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests }
    });
  }

  return { etapa, nomeEtapa, atualizado: true };
}

async function getDocumentText(docId, tokens) {
  const docs = getDocsClient(tokens);
  const doc = await docs.documents.get({ documentId: docId });
  const content = doc.data.body.content || [];
  return content
    .filter(e => e.paragraph?.elements)
    .flatMap(e => e.paragraph.elements)
    .filter(el => el.textRun)
    .map(el => el.textRun.content)
    .join('');
}

module.exports = {
  atualizarSecaoEtapa,
  getDocumentText
};
