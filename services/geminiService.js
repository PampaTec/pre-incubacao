const axios = require('axios');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');
const { getAdminTokens } = require('./tokenStore');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
const DRIVE_SKILL_FILE_ID = process.env.DRIVE_SKILL_FILE_ID;

let cachedSkillPrompt = null;

async function getSkillPrompt() {
  if (cachedSkillPrompt) return cachedSkillPrompt;
  if (!DRIVE_SKILL_FILE_ID) {
    cachedSkillPrompt = 'Você é um consultor.';
    return cachedSkillPrompt;
  }

  const tokens = getAdminTokens();
  if (!tokens) {
    cachedSkillPrompt = 'Você é um consultor.';
    return cachedSkillPrompt;
  }

  try {
    const auth = getAuthenticatedClient(tokens);
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.get(
      { fileId: DRIVE_SKILL_FILE_ID, alt: 'media' },
      { responseType: 'text' }
    );
    cachedSkillPrompt = res.data;
    console.log('[geminiService] Skill carregada e cacheada do Drive.');
    return cachedSkillPrompt;
  } catch (error) {
    console.error('Erro ao carregar skill do Drive:', error);
    cachedSkillPrompt = 'Você é um consultor.';
    return cachedSkillPrompt;
  }
}

function isQuotaError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  if (status === 429) return true;
  if (data?.error?.status === 'RESOURCE_EXHAUSTED') return true;
  return false;
}

async function tentarRequisicao(model, body) {
  if (!GEMINI_API_KEY) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response;
  } catch (error) {
    if (!isQuotaError(error)) {
      console.warn(`[geminiService] Modelo ${model} falhou:`, error.response?.status, error.response?.data?.error?.message || error.message);
    }
    return null;
  }
}

async function tentarModelos(models, body) {
  for (const model of models) {
    const response = await tentarRequisicao(model, body);
    if (!response) continue;

    const data = response.data;
    if (data.candidates && data.candidates.length > 0) {
      const texto = data.candidates[0].content.parts[0].text;
      return { texto, concluidoEtapa: extrairEtapaConcluida(texto) };
    }

    console.warn(`[geminiService] Modelo ${model} retornou sem candidatos, tentando próximo.`);
  }
  return null;
}

function extrairEtapaConcluida(texto) {
  const jsonMatch = texto.match(/\{"etapa_concluida"\s*:\s*(\d+)/);
  if (jsonMatch) return parseInt(jsonMatch[1], 10);

  const match = texto.match(/etapa (\d+)[\s\S]*?✅\s*concluído/i) || texto.match(/✅\s*concluído[\s\S]*?etapa (\d+)/i);
  if (match) return parseInt(match[1], 10);

  return null;
}

async function gerarResposta(historico, novaMensagem) {
  const systemPrompt = await getSkillPrompt();

  const contents = historico.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.conteudo }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: novaMensagem }]
  });

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents
  };

  const result = await tentarModelos(GEMINI_MODELS, body);
  if (result) return result;

  return {
    texto: '⚠️ Limite de uso da API Gemini foi atingido. O consultor voltará a funcionar quando a cota diária resetar (meia-noite, horário do Pacífico). Para resolver agora, o admin pode gerar uma nova chave de API em https://aistudio.google.com/apikey e colocar no arquivo `.env` como `GEMINI_API_KEY`.',
    concluidoEtapa: null
  };
}

module.exports = { gerarResposta };
