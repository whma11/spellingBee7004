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

## Production build

```bash
npm run build
```

`dist/` is a static site. Hash routes (`#/practice`, `#/dashboard`) work on GitHub Pages without extra server rules.
