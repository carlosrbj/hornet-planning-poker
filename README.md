<div align="center">

# 🐝 Planning Poker Hornet

**Estimativa colaborativa em tempo real para times ágeis**

*Focado em horas · Integrado ao Jira · Animações ricas*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

🇺🇸 [Read in English](README.EN.md)

</div>

---

> **Planning Poker Hornet** é um app web open-source para estimativa colaborativa de histórias em tempo real. Ao contrário da maioria das ferramentas que focam em story points, o Hornet é feito para times que estimam em **horas** — com integração nativa ao Jira Cloud, animações ricas e sem custo para self-host.

---

## ✨ Funcionalidades

- **🃏 Salas de votação em tempo real** — todos votam simultaneamente com reveal animado das cartas
- **⏱️ Timer por issue** — temporizador configurável com auto-skip de quem não votou
- **🔗 Integração com Jira Cloud** — importa sprints e issues via OAuth 2.0, sincroniza estimativas no campo do Jira
- **🔐 Login com Google** — autenticação via Supabase Auth, sem senha
- **👥 Presença em tempo real** — veja quem está online e quem já votou
- **😄 Emoji reactions** — reações durante a votação para engajamento do time
- **☕ Coffee break mode** — pausa com timer visual para o time respirar
- **🔄 Re-voto** — nova rodada na mesma issue quando o time não converge
- **📊 Gráficos de sprint** — distribuição de votos e dashboard de convergência
- **🎊 Confetti** — celebração quando o time converge na estimativa
- **🌓 Deck focado em horas** — valores de 1h a 32h, com ☕ `?` e `∞` como cartas especiais

---

## 🗂️ Stack

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.7+ |
| Estilização | Tailwind CSS | 4.x |
| Animações | Framer Motion | 12.x |
| Estado global | Zustand | 5.x |
| Cache de servidor | TanStack Query | 5.x |
| Database & Auth | Supabase | — |
| Tempo real | Supabase Realtime (Presence + Broadcast) | — |
| Integração | Jira Cloud | OAuth 2.0 (3LO) |
| Deploy | Vercel | — |

---

## ⚙️ Pré-requisitos

- **Node.js** 18+
- **Supabase CLI** — `npm install -g supabase`
- Contas em: [Supabase](https://supabase.com), [Google Cloud Console](https://console.cloud.google.com), [Atlassian Developer Console](https://developer.atlassian.com), [Vercel](https://vercel.com)

---

## 🚀 Configuração

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-org/planning-poker-hornet.git
cd planning-poker-hornet
npm install
cp .env.local.example .env.local
```

---

### 2. Variáveis de ambiente

Edite o `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Jira OAuth 2.0
JIRA_CLIENT_ID=seu-client-id
JIRA_CLIENT_SECRET=seu-client-secret
JIRA_REDIRECT_URI=https://seu-dominio.vercel.app/api/jira/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Supabase

**3.1 Criar projeto**

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Vá em **Settings → API** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

**3.2 Aplicar as migrations**

```bash
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase os arquivos em `supabase/migrations/` na ordem numérica.

**3.3 Habilitar Realtime**

No painel do Supabase → **Database → Replication**, habilite as tabelas:
- `issues`
- `votes`
- `room_participants`

---

### 4. Google OAuth

**4.1 Google Cloud Console**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Vá em **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Preencha nome do app, e-mail de suporte e logo (opcional)
4. Vá em **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs — adicione:
     ```
     https://<seu-project-ref>.supabase.co/auth/v1/callback
     ```
5. Copie o **Client ID** e o **Client Secret**

**4.2 Supabase Auth**

1. No painel do Supabase → **Authentication → Providers → Google**
2. Habilite o provider e cole o **Client ID** e **Client Secret**
3. Copie a **Callback URL** gerada e confirme que é a mesma adicionada no Google Console

---

### 5. Jira OAuth 2.0

**5.1 Atlassian Developer Console**

1. Acesse [developer.atlassian.com/console/myapps](https://developer.atlassian.com/console/myapps/)
2. Clique em **Create** → **OAuth 2.0 integration**
3. Dê um nome ao app (ex: "Planning Poker Hornet")
4. Em **Authorization**, adicione a callback URL:
   ```
   https://seu-dominio.vercel.app/api/jira/callback
   ```
   Para desenvolvimento local:
   ```
   http://localhost:3000/api/jira/callback
   ```
5. Em **Permissions**, adicione os escopos:
   - `read:jira-work`
   - `write:jira-work`
   - `read:sprint:jira-software`
6. Em **Settings**, copie o **Client ID** e o **Secret**
7. Cole no `.env.local`:
   ```env
   JIRA_CLIENT_ID=seu-client-id
   JIRA_CLIENT_SECRET=seu-client-secret
   JIRA_REDIRECT_URI=https://seu-dominio.vercel.app/api/jira/callback
   ```

> **Nota:** O token de acesso do Jira é renovado automaticamente 5 minutos antes de expirar. Os tokens são armazenados com segurança na tabela `jira_connections` com RLS ativo — nunca são expostos ao código client-side.

---

### 6. Vercel (Deploy)

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local` com os valores de produção — incluindo `JIRA_REDIRECT_URI` apontando para o domínio da Vercel
4. Clique em **Deploy**

> **Dica:** Após o primeiro deploy, atualize o **Authorized redirect URI** no Google Console e a **callback URL** no Atlassian Developer Console para usar o domínio real da Vercel.

---

### 7. Desenvolvimento local

```bash
npm run dev          # Inicia o servidor (localhost:3000)
npm run build        # Build de produção
npm run lint         # ESLint
npm run type-check   # tsc --noEmit

# Supabase local (opcional, requer Docker)
supabase start       # Inicia Supabase local
supabase db push     # Aplica migrations
supabase gen types typescript --local > src/lib/types/database.ts
```

---

## 📁 Estrutura do Projeto

```
planning-poker-hornet/
├── src/
│   ├── app/                   # Pages e API routes (App Router)
│   │   ├── api/
│   │   │   ├── auth/          # Callback de autenticação e logout
│   │   │   └── jira/          # Endpoints do Jira (connect, callback, boards, sprints, issues, sync)
│   │   ├── dashboard/         # Página principal após login
│   │   ├── room/[slug]/       # Sala de votação em tempo real
│   │   ├── settings/          # Configurações do usuário + Jira
│   │   └── login/             # Página de login
│   ├── components/
│   │   ├── dashboard/         # RoomCard, CreateRoomModal, JoinRoomInput
│   │   ├── jira/              # SyncButton, SprintSelector
│   │   ├── layout/            # Navbar, Providers
│   │   └── room/              # CardDeck, VoteReveal, Timer, IssueList, ParticipantList...
│   ├── hooks/                 # useRoom, useVoting, usePresence, useBroadcast, useTimer
│   ├── lib/
│   │   ├── jira/              # auth.ts (renovação automática de token), api.ts
│   │   ├── supabase/          # client.ts, server.ts, middleware.ts
│   │   ├── types/             # database.ts (gerado pelo Supabase CLI)
│   │   └── utils/             # deck.ts, animations.ts, consensus.ts, slug.ts
│   ├── stores/                # roomStore.ts, uiStore.ts (Zustand)
│   └── proxy.ts               # Auth proxy (substituto do middleware.ts no Next.js 16)
└── supabase/
    └── migrations/            # Schema SQL versionado
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para começar:

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feat/sua-feature`
3. Faça suas alterações seguindo as convenções do projeto (veja `CLAUDE.md`)
4. Abra um Pull Request descrevendo o que foi feito

---

## 📄 Licença

MIT © Planning Poker Hornet contributors
