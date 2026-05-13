const axios = require('axios');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getGeminiHeaders(tokens) {
  if (tokens && tokens.access_token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.access_token}`
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

function getGeminiUrl() {
  if (GEMINI_API_KEY) {
    return `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  }
  return GEMINI_URL;
}

async function getSkillPrompt(tokens) {
  const fileId = process.env.DRIVE_SKILL_FILE_ID;
  if (!fileId) return 'Você é um assistente.';

  try {
    const auth = getAuthenticatedClient(tokens);
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return res.data;
  } catch (error) {
    console.error('Erro ao carregar skill do Drive:', error);
    return 'Você é um consultor.';
  }
}

async function gerarResposta(tokens, historico, novaMensagem) {
  const systemPrompt = await getSkillPrompt(tokens);

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

  try {
    const response = await axios.post(
      getGeminiUrl(),
      body,
      { headers: getGeminiHeaders(tokens) }
    );

    const data = response.data;
    if (data.candidates && data.candidates.length > 0) {
      const texto = data.candidates[0].content.parts[0].text;

      let concluidoEtapa = null;

      const jsonMatch = texto.match(/\{"etapa_concluida"\s*:\s*(\d+)/);
      if (jsonMatch) {
        concluidoEtapa = parseInt(jsonMatch[1], 10);
      }

      if (!concluidoEtapa) {
        const match = texto.match(/etapa (\d+)[\s\S]*?✅\s*concluído/i) || texto.match(/✅\s*concluído[\s\S]*?etapa (\d+)/i);
        if (match) {
          concluidoEtapa = parseInt(match[1], 10);
        }
      }

      return { texto, concluidoEtapa };
    }

    return { texto: 'Sem resposta.', concluidoEtapa: null };
  } catch (error) {
    console.error('Erro no Gemini API:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao comunicar com o Gemini.');
  }
}

module.exports = { gerarResposta, getSkillPrompt };
