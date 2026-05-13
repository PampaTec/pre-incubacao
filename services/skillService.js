const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

const SKILL_FILE_ID = process.env.DRIVE_SKILL_FILE_ID;

function getDriveClient(tokens) {
  const auth = getAuthenticatedClient(tokens);
  return google.drive({ version: 'v3', auth });
}

const ETAPA_NAMES = [
  'proposta_de_valor',
  'segmento_de_clientes',
  'relacionamento_com_clientes',
  'canais',
  'fontes_de_receita',
  'parcerias_principais',
  'recursos_principais',
  'atividades_chave',
  'estrutura_de_custos'
];

async function lerArquivoSkill(tokens) {
  const drive = getDriveClient(tokens);
  const res = await drive.files.get(
    { fileId: SKILL_FILE_ID, alt: 'media' },
    { responseType: 'text' }
  );
  return res.data;
}

async function escreverArquivoSkill(conteudo, tokens) {
  const drive = getDriveClient(tokens);
  await drive.files.update({
    fileId: SKILL_FILE_ID,
    media: { body: conteudo, mimeType: 'text/markdown' }
  });
}

function extrairSecao(conteudo, titulo) {
  const regex = new RegExp(`## \\*{0,2}${titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n## |$)`, 'i');
  const match = conteudo.match(regex);
  return match ? match[0].trim() : '';
}

function limparMarcaLista(texto) {
  return texto.replace(/^[\s]*[-*+]\s+/gm, '').trim();
}

async function carregarSkill(tokens) {
  const conteudo = await lerArquivoSkill(tokens);

  const perfil = {
    nome: (conteudo.match(/\*\*Nome:\*\*\s*(.+)/) || [])[1] || '',
    role: (conteudo.match(/\*\*Role:\*\*\s*(.+)/) || [])[1] || '',
    objetivo: (conteudo.match(/\*\*Objetivo:\*\*\s*(.+)/) || [])[1] || '',
    tom_de_voz: (conteudo.match(/\*\*Tom de Voz:\*\*\s*(.+)/) || [])[1] || ''
  };

  const etapas = ETAPA_NAMES.map((nome, idx) => {
    const num = idx + 1;
    const secao = extrairSecao(conteudo, `ETAPA ${num}:`);

    const objetivo = (secao.match(/\*\*Objetivo:\*\*\s*(.+)/) || [])[1] || '';
    const perguntasRaw = secao.match(/\*\*Perguntas Base[^]*?(?=\*\*Atividade Prática|\n###|$)/);
    const perguntas = perguntasRaw
      ? [...perguntasRaw[0].matchAll(/^\s*\*\s*(.+)$/gm)].map(m => m[1].replace(/^\*+/, '').trim()).filter(Boolean)
      : [];
    const atividadePratica = (secao.match(/\*\*Atividade Prática[^:]*:\*\*\s*(.+)/) || [])[1] || '';

    return { nome, objetivo, perguntas, atividadePratica };
  });

  const analiseCritica = {
    visao_sistemica: (conteudo.match(/\*\*Visão Sistêmica[^:]*:\*\*\s*(.+)/) || [])[1] || '',
    elo_mais_fraco: (conteudo.match(/\*\*O Elo Mais Fraco[^:]*:\*\*\s*(.+)/) || [])[1] || '',
    prototipacao_mvp: (conteudo.match(/\*\*Prototipação Lean[^:]*:\*\*\s*(.+)/) || [])[1] || ''
  };

  const exemplosSecao = extrairSecao(conteudo, 'Exemplos de Contexto');
  const exemplos = [...exemplosSecao.matchAll(/^\*\s*(.+)$/gm)].map(m => m[1]).filter(Boolean);

  const exportacaoSecao = extrairSecao(conteudo, 'Geração do Documento Final');
  const opcoesExportacao = [...exportacaoSecao.matchAll(/- \*\*Opção \d+:[^*]+\*\*([^]*?)(?=\n\s*\n|$)/g)]
    .map(m => m[1].trim())
    .filter(Boolean);

  return {
    perfil,
    etapas,
    analiseCritica,
    exemplos,
    opcoesExportacao
  };
}

function montarSkill(dados) {
  const { perfil, etapas, analiseCritica, exemplos, opcoesExportacao } = dados;

  let md = `# Skill: Consultor de Startups PampaTec (BMC)

## 🧠 Perfil do Agente
**Nome:** ${perfil.nome}
**Role:** ${perfil.role}
**Objetivo:** ${perfil.objetivo}
**Tom de Voz:** ${perfil.tom_de_voz}
# Diretrizes Principais
Você é um mentor de negócios experiente e implacável (porém empático) focado em inovação. Seu objetivo é guiar empreendedores na jornada de validação de suas startups.
Sua regra de ouro: **NUNCA preencha o Canvas pelo empreendedor e nunca dê respostas prontas.** Seu papel é aplicar a Maiêutica Socrática: faça perguntas difíceis que obriguem o usuário a descobrir suas próprias falhas, validar premissas e fortalecer o modelo.


---

## 📋 Instruções de Execução

1.  **Apresentação:** Inicie apresentando-se como o consultor da Incubadora Tecnológica do PampaTec e explique que você guiará o empreendedor pelas 9 etapas de validação do negócio.
2.  **Fluxo Sequencial:** Você **DEVE** seguir estritamente a ordem das etapas (1 a 9) listadas abaixo. Não pule etapas.
3.  **Interação:**
    * Para cada etapa, apresente o **Objetivo** e faça as **Perguntas Base**.
    * Aguarde a resposta do usuário.
    * Analise a resposta. Se estiver vaga, peça mais detalhes baseados nas perguntas.
    * Após a resposta satisfatória, ofereça 2 alternativas:
        1- Quer desenvolver a **Atividade Prática** correspondente.
        2- Quer avançar para a próxima etapa?
    * Se a opção escolhida for a 1, oriente para que o usuário, após concluir a atividade prática, informe que concluiu a atividade prática, então avance para a próxima etapa.
    * Se a opção escolhida for a 2, apresente o texto final que o usuário definiu para a etapa atual, siga a regra de progresso automático e, então avance para a próxima etapa.

---

## 📊 Regra de Progresso Automático

**REGRA OBRIGATÓRIA:** Você DEVE manter automaticamente a planilha Google \`PROGRESSO_BMC\` e o Documento Google \`Modelo de Negócio - [Nome do Projeto]\` sempre atualizados a cada transição de etapa.

### Quando atualizar:
- **Ao iniciar a consultoria:** Crie a pasta do Projeto no Drive, Clone o \`Template Modelo de Negócio\` renomeando-o para \`Modelo de Negócio - [Nome do Projeto]\` e movendo-o para a pasta do projeto no Drive.
- **Ao concluir cada etapa:** Marque a etapa como ✅ Concluído, registre a data, e atualize a Planilha do BMC e o \`Modelo de Negócio - [Nome do Projeto]\` , incluindo neste documento o texto que o usuário definiu para a etapa.
- **Ao iniciar uma nova etapa:** Marque-a como 🔄 Em andamento na planilha e leia o arquivo \`Modelo de Negócio - [Nome do Projeto]\` para entender o progresso atual.
- **Ao concluir a Análise Crítica Final:** Marque como ✅ Concluído e preencha a seção de Diagnóstico.

### Template do Documento Google "Modelo de Negócio - [Nome do Projeto]":

\`\`\`Documento Drive
# 📊 Modelo de Negócio - [Nome do Projeto]

> **Projeto:** [Nome do Projeto]
> **Início:** [Data de início]
> **Última atualização:** [Data]

## Status Geral: Etapa X de 9 (XX%)

| # | Etapa | Status | Data Conclusão | Resposta do Time |
|---|-------|--------|----------------|--------|
| 1 | Proposta de Valor | ⬜ Pendente | - | - |
| 2 | Segmento de Clientes | ⬜ Pendente | - | - |
| 3 | Relacionamento com Clientes | ⬜ Pendente | - | - |
| 4 | Canais | ⬜ Pendente | - | - |
| 5 | Fontes de Receita | ⬜ Pendente | - | - |
| 6 | Parcerias Principais | ⬜ Pendente | - | - |
| 7 | Recursos Principais | ⬜ Pendente | - | - |
| 8 | Atividades-Chave | ⬜ Pendente | - | - |
| 9 | Estrutura de Custos | ⬜ Pendente | - | - |

## 🔍 Análise Crítica Final
- **Status:** ⬜ Pendente
- **Visão Sistêmica:** -
- **Elo Mais Fraco:** -
- **Experimento MVP:** -

## 📝 Histórico de Sessões
| Data | Etapas Trabalhadas | Observações |
|------|-------------------|-------------|
\`\`\`

### Regras de preenchimento:
- **Status:** Use \`⬜ Pendente\`, \`🔄 Em andamento\`, ou \`✅ Concluído\`
- **Resposta do Time:** Inclua as decisões-chave do time naquela etapa (máx. 2 parágrafos)
- **Histórico de Sessões:** Adicione uma linha a cada sessão de consultoria
- **Status Geral:** Atualize a porcentagem com base nas etapas concluídas
- **Última atualização:** Sempre atualize com a data corrente


# Exemplos de Contexto (Para inspirar o empreendedor)
`;

  const ETAPA_TITULOS = [
    'PROPOSTA DE VALOR',
    'SEGMENTO DE CLIENTES',
    'RELACIONAMENTO COM CLIENTES',
    'CANAIS',
    'FONTES DE RECEITA',
    'PARCERIAS PRINCIPAIS',
    'RECURSOS PRINCIPAIS',
    'ATIVIDADES-CHAVE',
    'ESTRUTURA DE CUSTOS'
  ];

  for (const ex of exemplos) {
    md += `* ${ex}\n`;
  }

  md += `\n---\n\n## 🚀 Roteiro de Consultoria (Passo a Passo)\n\n`;

  for (let i = 0; i < 9; i++) {
    const etapa = etapas[i];
    const titulo = ETAPA_TITULOS[i];
    md += `### ETAPA ${i + 1}: ${titulo}\n`;
    md += `* ***Objetivo:** ${etapa.objetivo || ''}\n`;
    md += `* **Perguntas Base para o Usuário:**\n`;
    for (const pergunta of (etapa.perguntas || [])) {
      md += `    * *${pergunta}\n`;
    }
    md += `* ***Atividade Prática Sugerida:** ${etapa.atividadePratica || ''}\n\n`;
  }

  md += `---\n\n# A Análise Crítica Final\n`;
  md += `Assim que os 9 blocos forem preenchidos de forma satisfatória, você deve compilar as informações e gerar um Diagnóstico Sistêmico:\n`;
  md += `1.  **Visão Sistêmica e Coerência:** ${analiseCritica.visao_sistemica || 'Onde o modelo quebra?'}\n`;
  md += `2.  **O Elo Mais Fraco:** ${analiseCritica.elo_mais_fraco || 'Identifique a hipótese mais arriscada do Canvas'}\n`;
  md += `3.  **Prototipação Lean (O MVP):** ${analiseCritica.prototipacao_mvp || 'Com base no "Elo Mais Fraco", exija do empreendedor o desenho de um experimento.'}\n`;

  md += `\n---\n\n# 📄 Geração do Documento Final (Exportação)\n\n`;
  md += `Assim que o diagnóstico sistêmico for concluído e o MVP validado teoricamente, você **DEVE** oferecer a consolidação de todo o trabalho em um documento final.\n\n`;
  md += `**Instruções para o Consultor:**\n`;
  md += `1. Parabenize o empreendedor pela finalização do seu Business Model Canvas.\n`;
  md += `2. Diga: *"Para que você possa compartilhar esse modelo com sua equipe, investidores ou aplicá-lo em outras ferramentas estruturadas, eu posso gerar um documento final com o seu BMC completo."*\n`;
  md += `3. Ofereça ao usuário as seguintes opções de formato de exportação:\n`;

  const opcoesPadrao = [
    '**Opção 1: Texto Puro (Markdown hiper-estruturado)** - Ideal para copiar e colar rapidamente em plataformas de gestão (Notion, Miro, Trello).',
    '**Opção 2: Arquivo Word (.docx)** - Você (Agente) irá gerar e salvar um arquivo Word estruturado no workspace atual contendo todo o Canvas.',
    '**Opção 3: Arquivo PDF (.pdf)** - Você (Agente) irá gerar o documento, convertendo o markdown para PDF, e salvar no workspace.'
  ];

  const opcoes = (opcoesExportacao && opcoesExportacao.length >= 3) ? opcoesExportacao : opcoesPadrao;
  for (let i = 0; i < opcoes.length; i++) {
    md += `   - ${opcoesPadrao[i]}\n`;
  }

  md += `\n**Ação:** Aguarde a escolha do usuário. Se o usuário escolher Word ou PDF, **você deve criar o documento na pasta do Projeto no Google Drive** com uma formatação de linguagem comercial alinhada aos princípios da Metodologia Business model Canvas e informar o caminho ao usuário.\n`;

  return md;
}

async function salvarVersaoAnterior(tokens) {
  const drive = getDriveClient(tokens);
  const dataStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nomeBackup = `skill_consultor_pampatec_backup_${dataStr}.md`;

  const res = await drive.files.copy({
    fileId: SKILL_FILE_ID,
    requestBody: { name: nomeBackup }
  });
  return res.data;
}

async function listarVersoes(tokens) {
  const drive = getDriveClient(tokens);
  const nomeBase = 'skill_consultor_pampatec_backup_';
  const res = await drive.files.list({
    q: `name contains '${nomeBase}' and trashed = false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 5
  });
  return res.data.files;
}

async function restaurarVersao(versaoId, tokens) {
  const conteudoBackup = await lerArquivoSkill(tokens);
  await escreverArquivoSkill(conteudoBackup, tokens);
}

module.exports = {
  carregarSkill,
  montarSkill,
  salvarVersaoAnterior,
  listarVersoes,
  restaurarVersao,
  lerArquivoSkill,
  escreverArquivoSkill
};
