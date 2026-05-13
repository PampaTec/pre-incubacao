const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const sheetsService = require('../services/sheetsService');

const router = express.Router();

router.get('/meu-time', requireAuth, async (req, res) => {
  try {
    const times = await sheetsService.listarTimes(req.session.tokens);
    const email = req.session.email;
    const meuTime = times.find(t => t.membros && t.membros.includes(email));
    if (!meuTime) return res.status(404).json({ error: 'Nenhum time encontrado para seu e-mail' });
    const progresso = await sheetsService.carregarProgresso(meuTime.id_time, req.session.tokens);
    res.json({ time: meuTime, progresso });
  } catch (err) {
    console.error('Erro ao buscar time do membro:', err);
    res.status(500).json({ error: 'Erro ao buscar seu time' });
  }
});

router.get('/progresso', requireAuth, async (req, res) => {
  try {
    const times = await sheetsService.listarTimes(req.session.tokens);
    const email = req.session.email;
    const meuTime = times.find(t => t.membros && t.membros.includes(email));
    if (!meuTime) return res.status(404).json({ error: 'Nenhum time encontrado' });
    const progresso = await sheetsService.carregarProgresso(meuTime.id_time, req.session.tokens);
    res.json(progresso);
  } catch (err) {
    console.error('Erro ao carregar progresso:', err);
    res.status(500).json({ error: 'Erro ao carregar progresso' });
  }
});

module.exports = router;
