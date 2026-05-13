const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const skillService = require('../services/skillService');
const sheetsService = require('../services/sheetsService');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const skill = await skillService.carregarSkill(req.session.tokens);
    res.json(skill);
  } catch (err) {
    console.error('Erro ao carregar skill:', err);
    res.status(500).json({ error: 'Erro ao carregar skill' });
  }
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const dados = req.body;
    if (!dados.perfil || !dados.etapas) {
      return res.status(400).json({ error: 'Dados da skill incompletos' });
    }

    const diff = await detectarAlteracoes(req.session.tokens, dados);

    await skillService.salvarVersaoAnterior(req.session.tokens);

    const conteudoMd = skillService.montarSkill(dados);
    await skillService.escreverArquivoSkill(conteudoMd, req.session.tokens);

    for (const item of diff) {
      await sheetsService.registrarAuditoriaSkill(
        req.session.email,
        item.secao,
        item.valorAnterior,
        item.valorNovo,
        req.session.tokens
      );
    }

    res.json({ success: true, alteracoes: diff.length });
  } catch (err) {
    console.error('Erro ao salvar skill:', err);
    res.status(500).json({ error: 'Erro ao salvar skill' });
  }
});

router.get('/versoes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const versoes = await skillService.listarVersoes(req.session.tokens);
    res.json(versoes);
  } catch (err) {
    console.error('Erro ao listar versões:', err);
    res.status(500).json({ error: 'Erro ao listar versões' });
  }
});

router.post('/rollback/:versaoId', requireAuth, requireAdmin, async (req, res) => {
  try {
    await skillService.salvarVersaoAnterior(req.session.tokens);
    await skillService.restaurarVersao(req.params.versaoId, req.session.tokens);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao restaurar versão:', err);
    res.status(500).json({ error: 'Erro ao restaurar versão' });
  }
});

router.get('/times-ativos', requireAuth, requireAdmin, async (req, res) => {
  try {
    const times = await sheetsService.listarTimes(req.session.tokens);
    res.json({ count: times.length });
  } catch (err) {
    console.error('Erro ao contar times:', err);
    res.json({ count: 0 });
  }
});

async function detectarAlteracoes(tokens, dadosNovos) {
  const dadosAntigos = await skillService.carregarSkill(tokens);
  const diff = [];

  if (dadosAntigos.perfil.nome !== dadosNovos.perfil.nome) {
    diff.push({ secao: 'perfil.nome', valorAnterior: dadosAntigos.perfil.nome, valorNovo: dadosNovos.perfil.nome });
  }
  if (dadosAntigos.perfil.role !== dadosNovos.perfil.role) {
    diff.push({ secao: 'perfil.role', valorAnterior: dadosAntigos.perfil.role, valorNovo: dadosNovos.perfil.role });
  }
  if (dadosAntigos.perfil.objetivo !== dadosNovos.perfil.objetivo) {
    diff.push({ secao: 'perfil.objetivo', valorAnterior: dadosAntigos.perfil.objetivo, valorNovo: dadosNovos.perfil.objetivo });
  }
  if (dadosAntigos.perfil.tom_de_voz !== dadosNovos.perfil.tom_de_voz) {
    diff.push({ secao: 'perfil.tom_de_voz', valorAnterior: dadosAntigos.perfil.tom_de_voz, valorNovo: dadosNovos.perfil.tom_de_voz });
  }

  for (let i = 0; i < 9; i++) {
    const antiga = dadosAntigos.etapas[i];
    const nova = dadosNovos.etapas[i];
    if (!antiga || !nova) continue;
    if (antiga.objetivo !== nova.objetivo) {
      diff.push({ secao: `etapa_${i + 1}.objetivo`, valorAnterior: antiga.objetivo, valorNovo: nova.objetivo });
    }
    if (JSON.stringify(antiga.perguntas) !== JSON.stringify(nova.perguntas)) {
      diff.push({ secao: `etapa_${i + 1}.perguntas`, valorAnterior: antiga.perguntas.join('|'), valorNovo: nova.perguntas.join('|') });
    }
    if (antiga.atividadePratica !== nova.atividadePratica) {
      diff.push({ secao: `etapa_${i + 1}.atividade`, valorAnterior: antiga.atividadePratica, valorNovo: nova.atividadePratica });
    }
  }

  if (JSON.stringify(dadosAntigos.analiseCritica) !== JSON.stringify(dadosNovos.analiseCritica)) {
    diff.push({ secao: 'analise_critica', valorAnterior: JSON.stringify(dadosAntigos.analiseCritica), valorNovo: JSON.stringify(dadosNovos.analiseCritica) });
  }

  return diff;
}

module.exports = router;
