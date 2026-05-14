const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const sheetsService = require('../services/sheetsService');
const { getAdminTokens } = require('../services/tokenStore');

const router = express.Router();

function getAdminTokenFallback(sessionTokens) {
  const adminTokens = getAdminTokens();
  return adminTokens || sessionTokens;
}

function getField(obj, ...keys) {
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return '';
}

function getMembros(obj) {
  const raw = getField(obj, 'membros', 'Membros', 'MEMBROS', 'Membros_Time', 'membros_time', 'email_membros', 'Emails', 'members', 'Membors');
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
  if (Array.isArray(raw)) return raw;
  return [];
}

router.get('/meu-time', requireAuth, async (req, res) => {
  try {
    const tokens = getAdminTokenFallback(req.session.tokens);
    const times = await sheetsService.listarTimes(tokens);
    const email = req.session.email;
    const meuTime = times.find(t => {
      const membros = getMembros(t);
      return membros.includes(email);
    });
    if (!meuTime) return res.status(404).json({ error: 'Nenhum time encontrado para seu e-mail' });
    const progresso = await sheetsService.carregarProgresso(meuTime.id_time, tokens);
    res.json({ time: meuTime, progresso });
  } catch (err) {
    console.error('Erro ao buscar time do membro:', err);
    res.status(500).json({ error: 'Erro ao buscar seu time' });
  }
});

router.get('/progresso', requireAuth, async (req, res) => {
  try {
    const tokens = getAdminTokenFallback(req.session.tokens);
    const times = await sheetsService.listarTimes(tokens);
    const email = req.session.email;
    const meuTime = times.find(t => {
      const membros = getMembros(t);
      return membros.includes(email);
    });
    if (!meuTime) return res.status(404).json({ error: 'Nenhum time encontrado' });
    const progresso = await sheetsService.carregarProgresso(meuTime.id_time, tokens);
    res.json(progresso);
  } catch (err) {
    console.error('Erro ao carregar progresso:', err);
    res.status(500).json({ error: 'Erro ao carregar progresso' });
  }
});

module.exports = router;
