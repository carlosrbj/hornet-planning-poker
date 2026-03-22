<div align="center">

# 🐝 Planning Poker Hornet

**Real-time collaborative estimation for agile teams**

*Hour-focused · Jira-native · Animation-rich*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

🇧🇷 [Leia em Português](README.md)

</div>

---

> **Planning Poker Hornet** is an open-source web app for real-time collaborative story estimation. Unlike most tools that focus on story points, Hornet is built for teams that estimate in **hours** — with native Jira Cloud integration, rich animations, and zero cost to self-host.

---

## ✨ Features

- **🃏 Real-time voting rooms** — everyone votes simultaneously with animated card reveal
- **⏱️ Per-issue timer** — configurable countdown with auto-skip for idle participants
- **🔗 Jira Cloud integration** — import sprints & issues via OAuth 2.0, sync estimates back to Jira custom fields
- **🔐 Google sign-in** — passwordless auth via Supabase Auth
- **👥 Live presence** — see who's online and who has voted, in real time
- **😄 Emoji reactions** — in-session reactions for team engagement
- **☕ Coffee break mode** — visual break timer so the team can breathe
- **🔄 Re-vote** — start a new round on the same issue when the team diverges
- **📊 Sprint charts** — vote distribution and convergence dashboard
- **🎊 Confetti** — celebrate when the team reaches consensus
- **🌓 Hour-focused deck** — values from 1h to 32h, plus ☕ `?` and `∞` special cards

---

## 🗂️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.7+ |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Global state | Zustand | 5.x |
| Server cache | TanStack Query | 5.x |
| Database & Auth | Supabase | — |
| Real-time | Supabase Realtime (Presence + Broadcast) | — |
| Integration | Jira Cloud | OAuth 2.0 (3LO) |
| Deploy | Vercel | — |

---

## ⚙️ Prerequisites

- **Node.js** 18+
- **Supabase CLI** — `npm install -g supabase`
- Accounts at: [Supabase](https://supabase.com), [Google Cloud Console](https://console.cloud.google.com), [Atlassian Developer Console](https://developer.atlassian.com), [Vercel](https://vercel.com)

---

## 🚀 Setup

### 1. Clone & install

```bash
git clone https://github.com/your-org/planning-poker-hornet.git
cd planning-poker-hornet
npm install
cp .env.local.example .env.local
```

---

### 2. Environment variables

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Jira OAuth 2.0
JIRA_CLIENT_ID=your-client-id
JIRA_CLIENT_SECRET=your-client-secret
JIRA_REDIRECT_URI=https://your-domain.vercel.app/api/jira/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Supabase

**3.1 Create a project**

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Navigate to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

**3.2 Apply migrations**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Or run the files in `supabase/migrations/` manually in the Supabase SQL Editor, in numerical order.

**3.3 Enable Realtime**

In the Supabase dashboard → **Database → Replication**, enable the following tables:
- `issues`
- `votes`
- `room_participants`

---

### 4. Google OAuth

**4.1 Google Cloud Console**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Fill in the app name, support email, and optional logo
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs — add:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
5. Copy the **Client ID** and **Client Secret**

**4.2 Supabase Auth**

1. In the Supabase dashboard → **Authentication → Providers → Google**
2. Enable the provider and paste your **Client ID** and **Client Secret**
3. Copy the generated **Callback URL** and confirm it matches what you added in the Google Console

---

### 5. Jira OAuth 2.0

**5.1 Atlassian Developer Console**

1. Go to [developer.atlassian.com/console/myapps](https://developer.atlassian.com/console/myapps/)
2. Click **Create** → **OAuth 2.0 integration**
3. Give your app a name (e.g. "Planning Poker Hornet")
4. Under **Authorization**, add your callback URL:
   ```
   https://your-domain.vercel.app/api/jira/callback
   ```
   For local development:
   ```
   http://localhost:3000/api/jira/callback
   ```
5. Under **Permissions**, add the following scopes:
   - `read:jira-work`
   - `write:jira-work`
   - `read:sprint:jira-software`
6. Under **Settings**, copy the **Client ID** and **Secret**
7. Paste into `.env.local`:
   ```env
   JIRA_CLIENT_ID=your-client-id
   JIRA_CLIENT_SECRET=your-client-secret
   JIRA_REDIRECT_URI=https://your-domain.vercel.app/api/jira/callback
   ```

> **Note:** Jira access tokens are automatically refreshed 5 minutes before expiry. Tokens are stored securely in the `jira_connections` table with Row Level Security enabled — they are never exposed to client-side code.

---

### 6. Vercel (Deploy)

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repository
3. Under **Environment Variables**, add all variables from `.env.local` with production values — including `JIRA_REDIRECT_URI` pointing to your Vercel domain
4. Click **Deploy**

> **Tip:** After your first deploy, update the **Authorized redirect URI** in Google Cloud Console and the **callback URL** in Atlassian Developer Console to use your real Vercel domain.

---

### 7. Local development

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit

# Optional: local Supabase with Docker
supabase start       # Start local Supabase instance
supabase db push     # Apply migrations
supabase gen types typescript --local > src/lib/types/database.ts
```

---

## 📁 Project Structure

```
planning-poker-hornet/
├── src/
│   ├── app/                   # Pages & API routes (App Router)
│   │   ├── api/
│   │   │   ├── auth/          # Auth callback & logout
│   │   │   └── jira/          # Jira endpoints (connect, callback, boards, sprints, issues, sync)
│   │   ├── dashboard/         # Main page after login
│   │   ├── room/[slug]/       # Real-time voting room
│   │   ├── settings/          # User settings + Jira connection
│   │   └── login/             # Login page
│   ├── components/
│   │   ├── dashboard/         # RoomCard, CreateRoomModal, JoinRoomInput
│   │   ├── jira/              # SyncButton, SprintSelector
│   │   ├── layout/            # Navbar, Providers
│   │   └── room/              # CardDeck, VoteReveal, Timer, IssueList, ParticipantList...
│   ├── hooks/                 # useRoom, useVoting, usePresence, useBroadcast, useTimer
│   ├── lib/
│   │   ├── jira/              # auth.ts (auto token refresh), api.ts
│   │   ├── supabase/          # client.ts, server.ts, middleware.ts
│   │   ├── types/             # database.ts (generated by Supabase CLI)
│   │   └── utils/             # deck.ts, animations.ts, consensus.ts, slug.ts
│   ├── stores/                # roomStore.ts, uiStore.ts (Zustand)
│   └── proxy.ts               # Auth proxy (Next.js 16 replacement for middleware.ts)
└── supabase/
    └── migrations/            # Versioned SQL schema
```

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes following the project conventions (see `CLAUDE.md`)
4. Open a Pull Request describing what you've done

---

## 📄 License

MIT © Planning Poker Hornet contributors
