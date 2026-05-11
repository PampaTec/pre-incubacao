# 📊 PampaTec - Programa de Pré-Incubação

![PampaTec Logo](file:///home/emersonrizzatti/Servidor_Local/PampaTec%20-%20Pr%C3%A9Incuba%C3%A7%C3%A3o/logo%20pampatec%20-%20fundo%20transparente.png)

O **Pré-Incubação PampaTec** é uma plataforma inteligente para a gestão da jornada de pré-incubação de startups. Através de um consultor de IA especializado, empreendedores são guiados na validação de seus modelos de negócio utilizando a metodologia **Business Model Canvas (BMC)**.

---

## 🚀 Diferenciais da Plataforma

- **Consultor de IA (Gemini):** Mentor virtual que utiliza maiêutica socrática para guiar o empreendedor, sem dar respostas prontas, garantindo aprendizado e validação real.
- **Arquitetura "No-DB":** Toda a persistência de dados é feita diretamente no **Google Drive** do administrador via Google APIs (Sheets e Docs), eliminando a necessidade de um banco de dados tradicional.
- **Gestão Automatizada:** Geração automática de documentos de modelo de negócio e planilhas de acompanhamento de progresso.
- **Foco em Inovação:** Interface moderna, intuitiva e focada na experiência do empreendedor.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | React + Vite, TailwindCSS (Mobile-First) |
| **Backend** | Node.js + Express |
| **IA** | Google Gemini API |
| **Autenticação** | Google OAuth 2.0 |
| **Persistência** | Google Drive API, Google Sheets API, Google Docs API |
| **Infraestrutura** | Render.com |

---

## 🏗️ Arquitetura de Dados

A plataforma utiliza o Google Drive como seu "banco de dados" estruturado:

1.  **Planilha de Progresso BMC:** Armazena dados de times, status de cada etapa, histórico de chat e auditoria da skill da IA.
2.  **Modelo de Negócio (Google Docs):** Documento dinâmico gerado para cada startup, atualizado em tempo real conforme as etapas do BMC são concluídas.
3.  **Skill do Consultor:** Um arquivo markdown no Drive que define o comportamento, tom de voz e regras de negócio da IA.

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
1.  Conta no **Google Cloud Console**.
2.  APIs Habilitadas: Drive, Sheets, Docs, Gmail e Generative Language.
3.  Credenciais OAuth 2.0 (Client ID e Secret).
4.  Pasta raiz no Drive com os templates iniciais.

### Configuração do Ambiente
Crie um arquivo `.env` na raiz do servidor com as seguintes variáveis:
```env
PORT=3000
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
ROOT_FOLDER_ID=id_da_pasta_no_drive
```

### Comandos Iniciais
```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev
```

---

## 🎨 Identidade Visual

- **Fonte:** Lily UPC
- **Paleta de Cores:**
  - **Verde Pampa:** `#00A859` (R0 G168 B89)
  - **Cinza:** `#727476` (R114 G115 B118)

---

## 📄 Documentação Relacionada

- [Plano de Implantação](file:///home/emersonrizzatti/Servidor_Local/PampaTec%20-%20Pr%C3%A9Incuba%C3%A7%C3%A3o/plano.md)
- [Skill do Consultor](file:///home/emersonrizzatti/Servidor_Local/PampaTec%20-%20Pr%C3%A9Incuba%C3%A7%C3%A3o/skill_consultor_pampatec.md)
- [Identidade Visual](file:///home/emersonrizzatti/Servidor_Local/PampaTec%20-%20Pr%C3%A9Incuba%C3%A7%C3%A3o/identidade_visual_pampatec.md)

## 🎨 Design e Experiência do Usuário

A interface é construída seguindo rigorosamente a [Identidade Visual PampaTec](file:///home/emersonrizzatti/Servidor_Local/PampaTec%20-%20Pr%C3%A9Incuba%C3%A7%C3%A3o/identidade_visual_pampatec.md), garantindo consistência institucional:
- **Cores Oficiais:** Verde Pampa (#00A859) e Cinza Corporativo (#727476).
- **Tipografia:** Lily UPC.
- **Princípios:** Interface "viva", com micro-animações, foco em dispositivos móveis e estética premium.

---
Developed for **PampaTec - Incubadora Tecnológica.**
