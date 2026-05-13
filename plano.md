# Plano de Implantação — PampaTec Pré-Incubação

> **Versão:** 2.0.0 
> **Data:** 2026-05-11  
> **Baseado em:** `skill_consultor_pampatec.md`

---

## 1. Visão Geral

O Pré-Incubação PampaTec é uma aplicação web para gestão da jornada de pré-incubação de startups. A equipe PampaTec administra times de empreendedores; cada time interage com um consultor de IA guiado pela *skill* do Business Model Canvas (BMC). O progresso é persistido inteiramente no Google Drive/Sheets via OAuth do Admin, sem banco de dados separado.

### Decisões de arquitetura consolidadas

| Decisão | Escolha |
|---------|---------|
| IA do Chat | **Gemini (Google AI)** via token OAuth do próprio usuário logado |
| Autenticação | **Google OAuth 2.0** (Admin e membros do time) |
| Banco de dados | **Google Sheets** (Planilha de Progresso BMC) + **Google Docs** (Modelo de Negócio) |
| Acesso ao Drive | **OAuth do Admin logado** (token armazenado no servidor, somente para Drive/Sheets/Docs) |
| Editor da Skill BMC | **Formulário estruturado por seções** (Opção 3) — sem acesso direto ao arquivo |
| Frontend | **React + Vite** com tailwindcss mobile first |
| Backend | **Node.js + Express** |
| Design System | **Identidade Visual PampaTec** (ver `identidade_visual_pampatec.md`) |

---

## Regra de Ouro do Frontend
Todo o desenvolvimento de interface (CSS, Componentes, Layout) **DEVE** seguir rigorosamente os padrões definidos em `identidade_visual_pampatec.md`. 
- **Cores primárias:** Verde (#00A859) e Cinza (#727476).
- **Tipografia:** Lily UPC (ou fallback sans-serif moderno que mantenha a legibilidade).
- **Aesthetics:** Design premium, vibrante e mobile-first.

---

## 1.1 Status da Implementação (Revisão em 2026-05-13)

| Fase | Status | Observações |
|------|--------|-------------|
| **Fase 1 — Fundação** | ✅ Completa | authRouter, middlewares, Layout, render.yaml |
| **Fase 2 — Drive** | ✅ Completa | driveService, sheetsService, docsService, mailService, páginas CRUD |
| **Fase 3 — Chat Gemini** | ✅ Completa | geminiService, chatRouter, ChatConsultor, MeuProjeto, detecção de etapas |
| **Fase 4 — Skill Editor** | ✅ Completa | skillService, skillRouter, SkillEditor, rollback, auditoria |
| **Fase 5 — Templates** | ✅ Completa | TemplateManager, Configuracoes, ProgressBar, sync-templates |
| **Fase 6 — Deploy** | ❌ Não iniciada | |

**Problemas conhecidos no código atual:**
1. `geminiService.js` foi refatorado para usar token OAuth prioritariamente, com fallback para `GEMINI_API_KEY`
2. URLs do frontend hardcoded (`http://localhost:3001`, `http://localhost:5174`) — pendente refatorar para `FRONTEND_URL`
3. Modal "Testar skill" com chat simulado — pendente para versão futura

---

## 2. Pré-requisitos

Antes de qualquer linha de código, providenciar:

1. **Conta Google Cloud** com um projeto criado (ex.: `pampatec-pre-incubacao`).
2. **APIs habilitadas** no projeto:
   - Google Drive API
   - Google Sheets API
   - Google Docs API
   - Google Gmail API (para envio de notificações)
   - Gemini API (Google AI Studio ou Vertex AI)
3. **Credenciais OAuth 2.0** (tipo "Web Application") com os seguintes escopos:
   - `https://www.googleapis.com/auth/drive` (Drive, para Admin)
   - `https://www.googleapis.com/auth/spreadsheets` (Sheets, para Admin)
   - `https://www.googleapis.com/auth/documents` (Docs, para Admin)
   - `https://www.googleapis.com/auth/gmail.send` (Gmail, para Admin)
   - `https://www.googleapis.com/auth/generative-language` (Gemini, para **todos os usuários**)
   - Redirect URI de desenvolvimento: `http://localhost:3000/auth/google/callback`
   - Redirect URI de produção: `https://<seu-dominio>.onrender.com/auth/google/callback`
4. **Conta no Render.com** com repositório GitHub conectado.
5. **Pasta raiz no Drive** chamada `Programa de Pré-Incubação PampaTec` criada manualmente pelo Admin, com os arquivos-template já presentes (Tutorial, Planilha de Progresso BMC, Template Modelo de Negócio, skill_consultor_pampatec.md).

---

## 3. Arquitetura Detalhada

```
pampatec-pre-incubacao/
├── server.js                        # Express: serve dist/ + rotas de API
├── render.yaml                      # Blueprint Render.com
├── .env.example                     # Variáveis de ambiente documentadas
│
├── routes/
│   ├── authRouter.js                # /auth/google, /auth/google/callback, /auth/logout
│   ├── adminRouter.js               # /api/admin/* (apenas Admins)
│   ├── teamRouter.js                # /api/teams/*
│   ├── templateRouter.js            # /api/templates — lista + sync
│   ├── skillRouter.js               # /api/skill — CRUD da skill por seções
│   └── chatRouter.js                # /api/chat (proxy para Gemini)
│
├── services/
│   ├── googleAuth.js                # Gerencia tokens OAuth, refresh
│   ├── driveService.js              # Criar pasta, clonar arquivo, compartilhar
│   ├── sheetsService.js             # Ler/gravar Planilha de Progresso BMC
│   ├── docsService.js               # Ler/gravar Modelo de Negócio
│   ├── mailService.js               # Enviar e-mail via Gmail API
│   ├── skillService.js              # Ler/parsear/montar skill do Drive por seções
│   └── geminiService.js             # Proxy de chamadas à Gemini API
│
└── src/                             # Frontend React + Vite
    ├── App.jsx                      # React Router v7
    ├── components/
    │   ├── Layout.jsx               # Navbar + proteção de rotas
    │   └── ProgressBar.jsx          # Barra de progresso BMC
    ├── features/
    │   ├── dashboard/               # Listagem de times + progresso geral
    │   ├── team-management/         # Criar/editar/excluir times e membros
    │   ├── chat/                    # Chat com Gemini + skill BMC
    │   ├── config/                  # Configurações Admin e OAuth
    │   ├── skill-editor/            # Editor de skill BMC por seções (formulário estruturado)
    │   └── templates/               # Gerenciador de Templates
    └── pages/
        ├── Dashboard.jsx            # /dashboard
        ├── NovoTime.jsx             # /novo-time
        ├── GerenciarTime.jsx        # /gerenciar-time/:id
        ├── MeuProjeto.jsx           # /time (visão do membro do time)
        ├── Configuracoes.jsx        # /configuracoes
        ├── SkillEditor.jsx          # /skill-editor
        └── TemplateManager.jsx      # /templates
```

---

## 4. Modelo de Dados (Google Sheets)

Toda a persistência fica na **Planilha de Progresso BMC** hospedada no Drive. Ela terá duas abas:

### Aba `TIMES`

| id_time | nome_projeto | pasta_drive_id | doc_modelo_id | membros (emails separados por vírgula) | data_criacao |
|---------|-------------|----------------|---------------|----------------------------------------|-------------|
| t_001   | StartupX    | 1abc...        | 1def...       | joao@gmail.com, maria@gmail.com        | 2026-05-11  |

### Aba `PROGRESSO_BMC`

| id_time | etapa | status | data_conclusao | resposta_time |
|---------|-------|--------|----------------|---------------|
| t_001   | 1     | ✅ Concluído | 2026-05-12 | "Ajudamos PMEs a..." |
| t_001   | 2     | 🔄 Em andamento | - | - |

### Aba `HISTORICO_CHAT`

| id_time | data_hora | role (user/model) | conteudo |
|---------|-----------|-------------------|---------|
| t_001   | 2026-05-11T10:00 | user | "Nosso produto resolve..." |
| t_001   | 2026-05-11T10:01 | model | "Que problema específico..." |

> **Nota:** O histórico do chat é carregado a cada sessão para alimentar o contexto da Gemini, garantindo continuidade da conversa entre sessões.

### Aba `HISTORICO_SKILL`

| data_hora | admin_email | secao_alterada | valor_anterior | valor_novo |
|-----------|-------------|----------------|----------------|------------|
| 2026-05-11T14:00 | admin@pampatec.org | etapa_1.perguntas | "Que problema..." | "Qual a dor..." |

> **Nota:** Auditoria de todas as alterações feitas via Editor de Skill. Permite rastrear quem mudou o quê e quando.

---

## 5. Fluxos Principais

### 5.1 Autenticação

```
Usuário → "Login com Google" → OAuth2 Google
→ Solicita escopos:
    - Admins: Drive + Sheets + Docs + Gmail + Gemini
    - Membros do time: apenas Gemini
→ Callback: servidor valida e-mail contra lista de Admins (aba TIMES) ou membros
→ Sessão gerada (cookie HTTP-only assinado) com access_token + refresh_token do usuário
→ Admin → painel /  |  Membro → /time
```

**Sessão do Admin** armazena tokens para operar Drive/Sheets/Docs/Gmail em nome do Admin.  
**Sessão de qualquer usuário** (Admin ou Membro) armazena o token Gemini, usado exclusivamente para o chat — cada um consome sua própria cota da API.

---

### 5.2 Criar Novo Time (Admin)

```
Admin preenche: Nome do Projeto + e-mails dos membros
→ driveService.criarPasta(nomeProjeto) dentro da pasta raiz do Programa
→ driveService.clonarTemplate(templateModeloId) → novo Doc na pasta do time
→ driveService.compartilhar(pastaId, emails[]) com permissão "editor"
→ sheetsService.registrarTime(id, nome, pastaId, docId, membros)
→ mailService.notificarMembros(emails, linkSistema)
→ Redireciona para /gerenciar-time/:id
```

---

### 5.3 Chat do Time com Consultor BMC (Gemini)

```
Membro abre /time
→ Sistema carrega HISTORICO_CHAT do time na Sheets (via token do Admin — leitura)
→ Monta system prompt = conteúdo de skill_consultor_pampatec.md + estado atual BMC
→ Membro envia mensagem
→ chatRouter → geminiService.enviar(
      token = req.session.accessToken,   ← token OAuth do próprio usuário logado
      historico + systemPrompt + mensagem
   )
→ Gemini responde (consumindo cota do usuário, não do sistema)
→ Resposta exibida no chat
→ sheetsService.salvarMensagem(id_time, role, conteudo)  ← via token Admin
→ [Se Gemini sinalizar conclusão de etapa]
    → sheetsService.atualizarProgresso(id_time, etapa, status, resposta)
    → docsService.atualizarModeloNegocio(docId, etapa, resposta)
```

**Detecção de conclusão de etapa:** A resposta da Gemini deve incluir uma marcação estruturada (ex.: JSON inline `{"etapa_concluida": 3, "texto_final": "..."}`) parseada pelo backend antes de ser enviada ao frontend.

> **Separação de tokens:** o token do usuário é usado **somente** para chamar a Gemini API. Toda escrita no Drive/Sheets/Docs usa o token do Admin, garantindo que membros sem escopos de Drive possam participar normalmente.

---

### 5.4 Gerenciador de Templates (Admin)

```
Admin acessa /templates
→ Sistema exibe lista de templates com botão "Abrir no Drive"
→ Admin edita diretamente no Google Drive (fora do sistema)
→ Admin clica "Sincronizar para equipes"
→ driveService.listarTimes() → para cada time:
    → copia Tutorial e Planilha de Progresso BMC atualizado para a pasta do time
    → [NÃO replica Template Modelo de Negócio]
→ Exibe confirmação de sincronização
```

**Alerta vermelho pulsante** aparece sempre que o Admin abre `/templates`, lembrando que edições no Drive não se propagam automaticamente.

### 5.5 Editor de Skill BMC por Seções (Admin)

O editor é um formulário estruturado que espelha a anatomia do arquivo `skill_consultor_pampatec.md`, dividido em seções editáveis independentes. O Admin nunca vê o arquivo bruto — apenas campos com rótulos claros.

**Estrutura do formulário (uma aba por bloco da skill):**

| Aba | Campos editáveis |
|-----|-----------------|
| **Perfil do Agente** | Nome, Role, Objetivo, Tom de Voz |
| **Etapa 1 a 9** (uma aba cada) | Objetivo da etapa, Perguntas Base (lista editável), Atividade Prática |
| **Análise Crítica Final** | Instrução de Visão Sistêmica, instrução do Elo Mais Fraco, instrução do MVP |
| **Exemplos de Contexto** | Exemplos por bloco do BMC (lista editável) |
| **Documento Final** | Texto das opções de exportação oferecidas ao empreendedor |

**Fluxo de uso:**

```
Admin acessa /skill-editor
→ skillService.carregarSkill(DRIVE_SKILL_FILE_ID)
    → lê o arquivo .md do Drive
    → parseia em objeto JSON estruturado por seções
→ Frontend exibe formulário preenchido com os valores atuais
→ Admin edita campos desejados
→ [Validação em tempo real]
    → campos obrigatórios não podem ficar vazios
    → lista de perguntas exige ao menos 1 item
    → alerta visual se etapa ficar sem Atividade Prática
→ Admin clica "Salvar skill"
→ skillService.montarSkill(dadosFormulario)
    → reconstrói o arquivo .md a partir do JSON
→ driveService.atualizarArquivo(DRIVE_SKILL_FILE_ID, conteudoMd)
→ Log de auditoria: data, e-mail do Admin, campos alterados
→ Toast de confirmação: "Skill atualizada com sucesso"
→ [Opcional] Admin clica "Testar skill"
    → abre modal com chat simulado usando a nova versão da skill
    → não afeta times em andamento
```

**Salvaguardas importantes:**

- Botão **"Restaurar versão anterior"** — mantém as últimas 5 versões do arquivo no Drive (como cópias nomeadas por data), permitindo rollback com um clique.
- Indicador **"Skill em uso por X times ativos"** — exibido antes de salvar, para que o Admin saiba o impacto imediato da mudança.
- A skill nova entra em vigor imediatamente para novas mensagens; o histórico de chat existente nos times não é alterado.

---

### Fase 1 — Fundação (Semanas 1–2)

**Objetivo:** Projeto rodando local com autenticação funcional.

- [x] Criar repositório GitHub com estrutura de pastas definida na seção 3.
- [x] Configurar `package.json` (Express, Vite, React Router v7, googleapis, `@google/generative-ai`, nodemailer).
- [x] Implementar `authRouter.js` com fluxo OAuth Google (passport-google-oauth20 ou raw OAuth2), solicitando escopo `generative-language` para todos os usuários e escopos Drive/Sheets/Docs/Gmail apenas para Admins.
- [x] Implementar middleware de proteção de rotas (Admin vs. Membro).
- [x] Criar `Layout.jsx` com Navbar e controle de acesso por papel.
- [x] Configurar `render.yaml` com variáveis de ambiente.
- [x] `.env.example` documentado.

**Entregável:** Login com Google funcionando, redirecionamento por papel (Admin/Membro), projeto deployável no Render.

---

### Fase 2 — Integração com Google Drive (Semanas 3–4)

**Objetivo:** CRUD de times com Drive operacional.

- [x] Implementar `driveService.js`:
  - `criarPasta(nome)`
  - `clonarArquivo(fileId, nome, pastaDestinoId)`
  - `compartilharComUsuarios(fileId, emails[])`
  - `listarArquivosNaPasta(pastaId)`
- [x] Implementar `sheetsService.js`:
  - `registrarTime(dados)`
  - `listarTimes()`
  - `atualizarProgresso(id_time, etapa, status, resposta)`
  - `salvarMensagemChat(id_time, role, conteudo)`
  - `carregarHistoricoChat(id_time)`
- [x] Implementar `docsService.js`:
  - `atualizarSecaoEtapa(docId, etapa, texto)`
- [x] Implementar `mailService.js` via Gmail API.
- [x] Criar página `NovoTime.jsx` + `adminRouter.js` com endpoint `POST /api/teams`.
- [x] Criar página `GerenciarTime.jsx` com listagem de membros e progresso por etapa.
- [x] Criar `Dashboard.jsx` (Admin) com visão geral de todos os times.

**Entregável:** Admin consegue criar time, Drive recebe pasta+doc, membros recebem e-mail.

---

### Fase 3 — Chat com Gemini + Skill BMC (Semanas 5–6)

**Objetivo:** Chat funcional com continuidade entre sessões e progresso salvo.

- [x] Implementar `geminiService.js`:
  - Carrega `skill_consultor_pampatec.md` do Drive como system prompt.
  - Monta histórico de conversa no formato Gemini (`role: user/model`).
  - Detecta marcação de conclusão de etapa na resposta.
- [x] Implementar `chatRouter.js` (`POST /api/chat`).
- [x] Criar feature `chat/` no frontend:
  - Componente de chat com histórico rolável.
  - Indicador de "Gemini digitando...".
- [x] Criar `MeuProjeto.jsx` (TeamDashboard do membro): progresso + chat.
- [x] Lógica de detecção e persistência de etapa concluída (Sheets + Docs).

> **⚠ Pendente:** `geminiService.js` usa `GEMINI_API_KEY` global — precisa ser refatorado para usar token OAuth do usuário conforme especificação da seção 5.3.

**Entregável:** Membro do time consegue conversar com o Consultor BMC, progresso é salvo na Sheets e no Doc do time.

---

### Fase 4 — Editor de Skill BMC por Seções (Semana 7)

**Objetivo:** Admin consegue editar o comportamento do Consultor sem tocar em arquivos.

- [x] Implementar `skillService.js`:
  - `carregarSkill(fileId)` — lê o `.md` do Drive e parseia em JSON estruturado por seções.
  - `montarSkill(json)` — reconstrói o `.md` a partir do formulário.
  - `salvarVersaoAnterior(fileId)` — copia o arquivo atual como backup datado antes de sobrescrever.
  - `listarVersoes(fileId)` — lista as últimas 5 versões salvas para rollback.
- [x] Implementar `skillRouter.js`:
  - `GET /api/skill` — retorna skill parseada em JSON.
  - `PUT /api/skill` — valida, monta e salva o `.md` atualizado no Drive.
  - `GET /api/skill/versoes` — lista versões anteriores.
  - `POST /api/skill/rollback/:versaoId` — restaura versão anterior.
- [x] Criar `SkillEditor.jsx` (`/skill-editor`) com:
  - Abas navegáveis por bloco (Perfil, Etapas 1–9, Análise Final, Exemplos).
  - Campos de texto simples, áreas de texto e listas com botões "Adicionar / Remover item".
  - Indicador "Skill em uso por X times ativos" antes de salvar.
  - Botão "Restaurar versão anterior" com lista das últimas 5 versões.
- [x] Registrar log de auditoria de alterações na aba `HISTORICO_SKILL` da Planilha BMC.

> **Pendente:** Modal "Testar skill" com chat simulado (será implementado em versão futura).

**Entregável:** Admin edita, valida, salva e reverte a skill via formulário — sem abrir o Drive ou editar Markdown.

---

### Fase 5 — Gerenciador de Templates + Polimento (Semana 8)

**Objetivo:** Funcionalidades Admin completas e UI consistente.

- [x] Criar `TemplateManager.jsx` com lista de templates e botões "Abrir no Drive".
- [x] Implementar alerta vermelho pulsante de mudanças não sincronizadas.
- [x] Implementar `POST /api/sync-templates` com lógica de replicação seletiva.
- [x] Criar `Configuracoes.jsx` (informações da conta, versão do sistema).
- [x] Adicionar `ProgressBar.jsx` reutilizável (9 etapas do BMC).
- [x] Responsividade mobile básica (TailwindCSS classes responsivas nas páginas).
- [x] Tratamento de erros e estados de carregamento em todas as telas.

> **Pendente:** Modal "Testar skill" com chat simulado; refatorar URLs hardcoded para usar variável de ambiente.

**Entregável:** Sistema completo e funcional.

---

### Fase 6 — Deploy e Homologação (Semana 9)

**Objetivo:** Sistema em produção validado pelo PampaTec.

- [ ] Configurar variáveis de ambiente no Render.com.
- [ ] Deploy via Blueprint (`render.yaml`).
- [ ] Teste de ponta a ponta com Admin real e time piloto.
- [ ] Ajustes de permissões no Google Cloud (escopos mínimos necessários).
- [ ] Documentar procedimento de onboarding para novos Admins.

---

## 7. Variáveis de Ambiente

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://<dominio>.onrender.com/auth/google/callback
# Não há GEMINI_API_KEY — a Gemini é chamada com o token OAuth de cada usuário

# Sessão
SESSION_SECRET=

# IDs dos arquivos-raiz no Drive (preenchidos após setup manual)
DRIVE_ROOT_FOLDER_ID=          # ID da pasta "Programa de Pré-Incubação PampaTec"
SHEETS_PROGRESSO_BMC_ID=       # ID da Planilha de Progresso BMC
DRIVE_TEMPLATE_MODELO_ID=      # ID do Template Modelo de Negócio
DRIVE_TEMPLATE_TUTORIAL_ID=    # ID do Tutorial Pré-incubação
DRIVE_SKILL_FILE_ID=           # ID do arquivo skill_consultor_pampatec.md

# Ambiente
NODE_ENV=production
PORT=3000
```

---

## 8. render.yaml

```yaml
services:
  - type: web
    name: pampatec-pre-incubacao
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: GOOGLE_REDIRECT_URI
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: DRIVE_ROOT_FOLDER_ID
        sync: false
      - key: SHEETS_PROGRESSO_BMC_ID
        sync: false
      - key: DRIVE_TEMPLATE_MODELO_ID
        sync: false
      - key: DRIVE_TEMPLATE_TUTORIAL_ID
        sync: false
      - key: DRIVE_SKILL_FILE_ID
        sync: false
```

---

## 9. Pontos de Atenção e Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Token OAuth do Admin expira | Drive/Sheets/Docs param de funcionar | Implementar refresh automático; alertar Admin para reconectar |
| Token OAuth do Membro expira durante o chat | Chat interrompido para aquele usuário | Frontend detecta erro 401 da Gemini e exibe botão "Reconectar com Google" |
| Usuário não concede escopo Gemini no login | Chat não funciona para esse usuário | Tela de erro clara com botão de reautorização; escopo solicitado como obrigatório no fluxo OAuth |
| Limite de requisições à Gemini API (por usuário) | Chat lento ou bloqueado para o usuário específico | Debounce no envio; feedback visual de rate limit; impacto isolado (não afeta outros times) |
| Planilha BMC como banco único | Concorrência em times simultâneos | Usar operações atômicas por linha; evitar writes paralelos na mesma aba |
| Admin revoga permissão OAuth | Sistema perde acesso ao Drive | Instruir que o e-mail Admin é "conta de serviço humana"; documentar procedimento de reautenticação |
| Skill editada de forma incoerente pelo Admin | Comportamento errático do Consultor BMC em todos os times ativos | Validação obrigatória no formulário; modal de confirmação com indicador de impacto; rollback com 1 clique para versão anterior |
| Skill do Consultor no Drive editável diretamente | Mudança acidental fora do formulário quebra o parser | Restringir permissão de edição do arquivo no Drive somente à conta Admin principal; o sistema sempre lê via API |
| Template Modelo de Negócio sendo sobrescrito pela sincronização | Perda de dados dos times | Regra explícita no `sync-templates`: arquivo `DRIVE_TEMPLATE_MODELO_ID` é excluído da lista de sincronização |

---

## 10. Checklist de Setup Inicial (Antes do Primeiro Deploy)

- [X] Criar projeto no Google Cloud Console.
- [X] Habilitar as APIs listadas na seção 2 (Drive, Sheets, Docs, Gmail, Generative Language).
- [X] Criar credenciais OAuth 2.0, configurar escopos por papel e anotar Client ID + Secret.
- [X] Criar manualmente a pasta raiz no Drive com os 4 arquivos-template.
- [X] Anotar os IDs de todos os arquivos/pasta (visíveis na URL do Drive): IDs do Google.md
- [ ] Criar repositório no GitHub e conectar ao Render.com: https://github.com/PampaTec/pre-incubacao.git
- [ ] Preencher todas as variáveis de ambiente no painel do Render.
- [ ] Fazer primeiro deploy e testar login do Admin.
- [ ] Admin faz login → autoriza escopos do Drive → tokens salvos na sessão.
- [ ] Testar Editor de Skill: carregar, editar uma etapa, salvar e verificar reflexo no chat.
- [ ] Criar time piloto e validar fluxo completo (pasta, doc, e-mail, chat).
