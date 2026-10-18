# Spelling Bee Practice (React)

A free, client-only auditory spelling trainer for the [UIL A+ Spelling](https://www.uiltexas.org/aplus/events/aplus-spelling) 2026–2027 lists (grades 3–4, 5–6, and 7–8). Parents run the session while the child listens; the target word stays hidden unless a parent peeks.

Working plan (what is done, what is next): [PLAN.md](./PLAN.md).

- React + Vite, hosted as static files (GitHub Pages / Vercel)
- Free on-device speech: browser `speechSynthesis` **or** open-source [eSpeak NG](https://github.com/espeak-ng/espeak-ng) (no cloud TTS)
- Progress in `localStorage` (`isMastered`, `wrongCount`, daily trend)
- Optional family PIN and per-kid PIN so siblings on the same device keep separate dashboards

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Use **Spell** (`#/practice`) for rounds and **Progress** (`#/dashboard`) to pick a grade list and pool filter.

## Rebuild the word JSON from the official PDF

Place `A+_Spelling_2026-2027.pdf` at `c:\Users\whma\Downloads\A+_Spelling_2026-2027.pdf` (or edit the path in `scripts/extract_uil_words.py`) and run:

```bash
python scripts/extract_uil_words.py
```

That writes `src/data/grades-3-4.json` (600 words), `grades-5-6.json` (800), and `grades-7-8.json` (900).

## Use on a phone or iPad

Scores live **in the browser on that device**. They do not copy from the PC. Use Safari on iPhone/iPad, then Share → **Add to Home Screen**. Tap **Sound word** once so iOS allows speech.

This GitHub repo is **private**. Free GitHub Pages only works for public repos, so pick one path:

### A. Same Wi‑Fi as the PC (repo stays private)

On the PC, with the app already installed:

```bash
npm run build
npm run share
```

On the phone/iPad, open the Network URL Vite prints (looks like `http://192.168.x.x:4173`). The PC must stay on.

### B. Public website (works away from home)

1. **Vercel (recommended if you want the GitHub repo to stay private):** open [vercel.com/new](https://vercel.com/new), import `whma11/spellingBee7004`, deploy. You get a `*.vercel.app` link.
2. **GitHub Pages:** make the repo public (GitHub → Settings → Change visibility), then re-run the **Deploy GitHub Pages** Action. URL: **https://whma11.github.io/spellingBee7004/**

## Production build

```bash
npm run build
```

`dist/` is a static site. Hash routes (`#/practice`, `#/dashboard`) work on GitHub Pages without extra server rules.
