# BabelBridge

**AI-powered multiplayer language learning — practice with friends, guided by AI.**

BabelBridge lets you run real conversations with friends in a foreign language. An AI referee scores each response, highlights your mistakes word-by-word, and keeps the session moving at your pace. Supports Russian, Chinese, Swedish and more across A1–C2 levels.

---

## Features

- **Multiplayer rooms** — create or join a study room with a short code
- **AI-guided conversations** — the AI plays as a participant and scores every turn
- **Live scoring** — word-level diff highlighting shows exactly what was right and wrong
- **Text mode toggle** — switch between Roman script, native script, and English translation mid-session
- **Text-to-speech** — listen button on every bubble using Web Speech API
- **Hint system** — collapsible hint on the prompt card before you commit your answer
- **Results breakdown** — per-player averages and a full turn-by-turn accordion at the end
- **PWA** — installable on mobile, works offline for static assets

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | JWT stored in localStorage |
| Backend | FastAPI (separate repo) |
| Realtime | Polling every 2.5s |
| TTS | Web Speech API |

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Set your backend URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Routes

| Route | Description |
|---|---|
| `/` | Login / register |
| `/dashboard` | Rooms list — create or join |
| `/rooms/[roomId]` | Waiting room — members, join code, start |
| `/rooms/[roomId]/conversation/[convId]` | Live conversation |
| `/rooms/[roomId]/conversation/[convId]/results` | Results screen |
| `/privacy` | Privacy policy |

---

## Deployment

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_API_URL` → your deployed FastAPI URL
4. Deploy
