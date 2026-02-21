# BabelBridge — Next.js Frontend

AI-powered multiplayer language learning app. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Point this at your running FastAPI backend.

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

1. Push to GitHub
2. Import at vercel.com
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your deployed FastAPI URL (e.g. `https://your-api.railway.app`)
4. Deploy

---

## Screens

| Route | Description |
|-------|-------------|
| `/` | Auth — login / register tabbed |
| `/dashboard` | Rooms list + create/join forms |
| `/rooms/[roomId]` | Waiting room — members, join code, scenario input, start button |
| `/rooms/[roomId]/conversation/[convId]` | Live conversation — bubbles, prompt card, score bar, TTS |
| `/rooms/[roomId]/conversation/[convId]/results` | Results — per-player averages + turn-by-turn breakdown |

## Key Features

- **JWT stored in localStorage** — persists across tabs and refreshes
- **Polling every 2.5s** — keeps waiting room and conversation in sync
- **Text mode toggle** (Roman / Native / English) — in the conversation header, applies to all bubbles simultaneously, saved to localStorage
- **Input mode toggle** (Roman / Native) — on the prompt card per turn, saved per language
- **Post-submit reveal** — after submitting, bubble shows what you typed with word-level diff highlighting (green = correct, red = wrong), the target line, and score breakdown
- **AI turns** — shown with a 1.8s typing animation before revealing the line
- **TTS** — 🔊 Listen button on every bubble uses Web Speech API at 0.85x speed
- **Hint system** — collapsible "Show hint" on the prompt card before submitting
- **Results screen** — expandable turn-by-turn accordion with full breakdown
