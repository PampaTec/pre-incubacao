const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const driveService = require('../services/driveService');
const sheetsService = require('../services/sheetsService');
const mailService = require('../services/mailService');

const router = express.Router();

function gerarIdTime() {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

router.get('/teams', requireAuth, requireAdmin, async (req, res) => {
  try {
    const times = await sheetsService.listarTimes(req.session.tokens);
    res.json(times);
  } catch (err) {
    console.error('Erro ao listar times:', err);
    res.status(500).json({ error: 'Erro ao listar times' });
  }
});

router.get('/teams/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const time = await sheetsService.buscarTimePorId(req.params.id, req.session.tokens);
    if (!time) return res.status(404).json({ error: 'Time não encontrado' });
    const progresso = await sheetsService.carregarProgresso(req.params.id, req.session.tokens);
    res.json({ time, progresso });
  } catch (err) {
    console.error('Erro ao buscar time:', err);
    res.status(500).json({ error: 'Erro ao buscar time' });
  }
});

router.post('/teams', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nome_projeto, membros } = req.body;
    if (!nome_projeto || !membros || membros.length === 0) {
      return res.status(400).json({ error: 'Nome do projeto e membros são obrigatórios' });
    }

    const tokens = req.session.tokens;
    const id_time = gerarIdTime();

    const pasta = await driveService.criarPasta(nome_projeto, tokens);
    const pastaId = pasta.id;

    const docClone = await driveService.clonarArquivo(
      process.env.BMC_TEMPLATE_DOC_ID,
      `Modelo de Negócio - ${nome_projeto}`,
      pastaId,
      tokens
    );

    await driveService.compartilharComUsuarios(pastaId, membros, tokens);
    await driveService.compartilharComUsuarios(docClone.id, membros, tokens, 'writer');

    await sheetsService.registrarTime({
      id_time,
      nome_projeto,
      pasta_drive_id: pastaId,
      doc_modelo_id: docClone.id,
      membros
    }, tokens);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    await mailService.notificarMembros(membros, nome_projeto, frontendUrl, tokens);

    res.status(201).json({ id_time, nome_projeto, pasta_drive_id: pastaId, doc_modelo_id: docClone.id });
  } catch (err) {
    console.error('Erro ao criar time:', err);
    res.status(500).json({ error: 'Erro ao criar time', details: err.message });
  }
});

router.get('/progresso/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const progresso = await sheetsService.carregarProgresso(req.params.id, req.session.tokens);
    res.json(progresso);
  } catch (err) {
    console.error('Erro ao carregar progresso:', err);
    res.status(500).json({ error: 'Erro ao carregar progresso' });
  }
});

module.exports = router;
