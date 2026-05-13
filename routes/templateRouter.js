const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const driveService = require('../services/driveService');
const sheetsService = require('../services/sheetsService');

const router = express.Router();

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID;
const TUTORIAL_DOC_ID = process.env.TUTORIAL_DOC_ID;
const SHEETS_PROGRESSO_BMC_ID = process.env.PROGRESS_SHEET_ID;

router.get('/lista', requireAuth, requireAdmin, async (req, res) => {
  try {
    const arquivos = await driveService.listarArquivosNaPasta(ROOT_FOLDER_ID, req.session.tokens);
    const templates = [
      { id: TUTORIAL_DOC_ID, nome: 'Tutorial Pré-Incubação', tipo: 'Documento' },
      { id: SHEETS_PROGRESSO_BMC_ID, nome: 'Planilha de Progresso BMC', tipo: 'Planilha' },
      { id: process.env.DRIVE_SKILL_FILE_ID, nome: 'skill_consultor_pampatec.md', tipo: 'Arquivo' }
    ];
    res.json(templates);
  } catch (err) {
    console.error('Erro ao listar templates:', err);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
});

router.post('/sync', requireAuth, requireAdmin, async (req, res) => {
  try {
    const times = await sheetsService.listarTimes(req.session.tokens);
    let count = 0;

    for (const time of times) {
      const pastaId = time.pasta_drive_id || time.Pasta_Drive_ID;
      if (!pastaId) continue;

      if (TUTORIAL_DOC_ID) {
        await driveService.clonarArquivo(
          TUTORIAL_DOC_ID,
          `Tutorial - ${time.nome_projeto || time.Nome_Projeto}`,
          pastaId,
          req.session.tokens
        );
        count++;
      }
    }

    res.json({ success: true, timesAtualizados: count, total: times.length });
  } catch (err) {
    console.error('Erro ao sincronizar templates:', err);
    res.status(500).json({ error: 'Erro ao sincronizar templates' });
  }
});

module.exports = router;
