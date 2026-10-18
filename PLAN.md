# Spelling Bee Practice — working plan

Living document for the UIL A+ Spelling 2026–2027 auditory trainer. Use this after a session instead of re-pasting the PRD.

Official contest context: [UIL A+ Spelling](https://www.uiltexas.org/aplus/events/aplus-spelling).

Word source PDF (local, not in git): `c:\Users\whma\Downloads\A+_Spelling_2026-2027.pdf`

---

## Product in one paragraph

Parent-run, **screen-free** spelling drill. The child listens; the parent taps **Sound word** / **Sound sentence** and marks Correct or Incorrect. Everything is client-side (React + Vite, Web Speech API, LocalStorage) so it can sit on GitHub Pages or Vercel with no backend.

---

## Status (2026-10-18)

**MVP is implemented and was running at `http://localhost:5173`.** The first coding session ended during browser verification (usage limit). You already saw the app locally — that is the right place to resume.

| PRD item | Status |
| --- | --- |
| React SPA, Tailwind, hash routes (`#/practice`, `##/dashboard`) | Done |
| Extract 3–4 / 5–6 / 7–8 lists from the UIL PDF | Done (`600` / `800` / `900` words) |
| Two spoken sentences per word | Done, **template quality** (see gap below) |
| Hide word during a round; parent peek | Done |
| Sound word / sentence 1 / sentence 2 | Done |
| Pronunciation controls (voice, rate, pitch, repeat, eSpeak NG) | Done |
| Load next word from filtered pool | Done |
| Correct → `isMastered = true`; Incorrect → `wrongCount += 1` | Done |
| Pool: ALL_WORDS vs UNLEARNED_DIFFICULT | Done (Progress tab) |
| Grade list picker | Done (Progress tab) |
| Counters: mastered / difficult / remaining | Done |
| SVG daily trend from LocalStorage | Done |
| Persist in this browser | Done (`localStorage` key `spellingBee7004.v2`) |
| Per-kid profiles with optional family/kid PINs | Done (on-device only) |
| Free static hosting | **Not done** |
| Git commit / GitHub remote | **Not done** (working tree is still uncommitted) |

### Data shape (each word)

```json
{
  "id": 1,
  "word": "ability",
  "altSpellings": [],
  "note": null,
  "sentence1": "…",
  "sentence2": "…"
}
```

Progress is **not** stored in JSON. It lives in LocalStorage:

```json
{
  "isMastered": false,
  "wrongCount": 0
}
```

Rebuild lists from the PDF:

```bash
python scripts/extract_uil_words.py
```

---

## How to run

```bash
npm install
npm run dev
```

- Spell tab: `#/practice`
- Progress tab: `#/dashboard`

Production: `npm run build` → static `dist/`. `base: './'` and hash routing are already set for GitHub Pages.

---

## Recommended next step (do this first)

**Do a 10-minute parent dry-run on localhost with Edge or Chrome, with the child in the room if possible.** That is the only way to confirm the product, not just the code.

Checklist:

1. Open Spell. Confirm the word is hidden until **Peek word**.
2. **Sound word** — is the pronunciation usable? (Windows voices vary; Chrome/Edge are better than Firefox.)
3. **Sound sentence** then **Alternate sentence**.
4. Mark **Incorrect / Fail**, **Load next word**, then **Correct / Pass**.
5. Open Progress: counters and today’s trend should move.
6. Switch pool to **Unlearned & difficult only** and confirm passed words drop out of the next-word cycle.
7. Switch grade list (5–6 or 7–8) and confirm progress is per list.

If that session feels good, the app is ready to **use daily**. Code polish can wait.

---

## After the dry-run — ordered backlog

Do these in order. Stop when the app is useful enough.

### 1. Deploy

GitHub Action `.github/workflows/pages.yml` builds `dist/` and publishes GitHub Pages from `main`.

Live URL: https://whma11.github.io/spellingBee7004/

Progress is per browser/device (not synced). On iPad: Safari → Share → Add to Home Screen.

### 2. Sentence quality

Kid-friendly meaning sentences live in `src/data/sentence-jobs/` and are merged with:

```bash
python scripts/apply_kid_sentences.py
python scripts/validate_sentences.py
```

Re-extracting the PDF keeps those sentences when `scripts/extract_uil_words.py` runs. Do **not** put the official PDF in git.

### 3. Practice-session UX (after you have used it once)

Likely wants from a real round:

- Undo last mark (wrong radio tap).
- Browse or search words on Progress (un-pass a word without failing it again).
- Session length (“10 words then stop”) and a simple end-of-session recap.

### 4. Learning-project extras (optional)

Not required for the child to practice:

- Tests for `pool.js` / `storage.js`.
- Export/import LocalStorage JSON (move progress to another device).
- PWA so it works offline on an iPad.

---

## App map (for the next coding session)

| Path | Role |
| --- | --- |
| `src/pages/PracticePage.jsx` | Spell tab |
| `src/pages/DashboardPage.jsx` | Grade + pool + stats + chart |
| `src/state/AppState.jsx` | Shared state + scoring |
| `src/lib/speech.js` | Web Speech API + eSpeak NG playback |
| `src/components/SpeechControls.jsx` | Voice, rate, pitch, engine picker |

### Speech engines (both free)

1. **Browser voices** — W3C Web Speech API (`speechSynthesis`). Uses Windows/Chrome voices. No API key.
2. **eSpeak NG** — open-source formant TTS via `@spelling-creator/spellophone` (GPL-3.0). Voice data is copied from the npm package into `public/espeak-ng-data` at dev/build time. Same pronunciation on every device.

Settings persist in LocalStorage under `speech` (`engine`, `voiceURI`, `espeakVoice`, `rate`, `pitch`, `autoSpeakWord`).
| `src/lib/pool.js` | Filter + random pick + counters |
| `src/lib/storage.js` | LocalStorage |
| `src/data/grades-*.json` | Word lists |
| `scripts/extract_uil_words.py` | PDF → JSON + template sentences |

---

## Out of scope (keep it a pet project)

- Accounts, cloud TTS, a real database.
- Putting the official PDF in the repo.
- Replacing UIL contest rules; this is **practice only**.
