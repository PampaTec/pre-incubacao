const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const geminiService = require('../services/geminiService');
const sheetsService = require('../services/sheetsService');
const docsService = require('../services/docsService');
const { getAdminTokens } = require('../services/tokenStore');

const router = express.Router();

function getAdminTokenFallback(sessionTokens) {
  const adminTokens = getAdminTokens();
  return adminTokens || sessionTokens;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const { id_time, doc_modelo_id, mensagem } = req.body;
    const tokens = req.session.tokens;
    const adminTokens = getAdminTokenFallback(tokens);

    if (!id_time || !mensagem) {
      return res.status(400).json({ error: 'id_time e mensagem são obrigatórios' });
    }

    await sheetsService.salvarMensagemChat(id_time, 'user', mensagem, adminTokens);

    const historicoSheets = await sheetsService.carregarHistoricoChat(id_time, adminTokens);
    
    const historico = historicoSheets.map(msg => ({
      role: (msg.role || msg.Role || '').toLowerCase() === 'model' ? 'model' : 'user',
      conteudo: msg.conteudo || msg.Conteudo || msg['conteúdo'] || msg['Conteúdo'] || ''
    }));

    const { texto, concluidoEtapa } = await geminiService.gerarResposta(historico, mensagem);

    await sheetsService.salvarMensagemChat(id_time, 'model', texto, adminTokens);

    if (concluidoEtapa && doc_modelo_id) {
      await sheetsService.atualizarProgresso(id_time, concluidoEtapa, '✅ Concluído', 'Concluído pelo Chat', adminTokens);
      await docsService.atualizarSecaoEtapa(doc_modelo_id, concluidoEtapa, `Resumo gerado pelo Consultor via Chat:\n${texto}`, adminTokens);
    }

    res.json({ texto, concluidoEtapa });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem do chat' });
  }
});

router.get('/:id_time', requireAuth, async (req, res) => {
  try {
    const { id_time } = req.params;
    const tokens = getAdminTokenFallback(req.session.tokens);
    const historicoSheets = await sheetsService.carregarHistoricoChat(id_time, tokens);
    res.json(historicoSheets);
  } catch (error) {
    console.error('Erro ao carregar chat:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
});

module.exports = router;
