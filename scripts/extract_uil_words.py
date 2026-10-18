"""Extract UIL 2026-2027 spelling lists from the official PDF and emit JSON."""

from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader

PDF_PATH = Path(r"c:\Users\whma\Downloads\A+_Spelling_2026-2027.pdf")
OUT_DIR = Path(__file__).resolve().parents[1] / "src" / "data"

GRADE_MARKERS = {
    "grades-3-4": re.compile(r"Grades\s*3-4", re.I),
    "grades-5-6": re.compile(r"Grades\s*5-6", re.I),
    "grades-7-8": re.compile(r"Grades\s*7-8", re.I),
}

ENTRY_RE = re.compile(r"(?m)^(\d+)\.\s+")
NOISE_RE = re.compile(
    r"(Page \d+|UIL A\+|Spelling Word List|Grades \d-\d.*|University Interscholastic.*|"
    r"1701 Manor|phone:|e-mail:|web: www\.uiltexas)",
    re.I,
)
FOOTER_CUT_RE = re.compile(
    r"(Page\s*22|University Interscholastic League\s*1701)",
    re.I,
)


def normalize_list_text(text: str) -> str:
    """Repair PDF extraction glitches that split list numbers across spaces/newlines."""
    text = text.replace("\t", " ").replace("\u00a0", " ")
    text = FOOTER_CUT_RE.split(text, maxsplit=1)[0]
    # "287 . knapsack" / "17 4. flutist"
    text = re.sub(r"(?m)(^|\n)(\d+)\s+\.", r"\1\2.", text)
    text = re.sub(r"(?m)(^|\n)(\d+)\s+(\d+)\.", r"\1\2\3.", text)
    # "3\n71. notepad" / "59\n1. wry"
    text = re.sub(r"(?m)(^|\n)(\d+)\n(\d+)\.", r"\1\2\3.", text)
    text = re.sub(r"[ ]{2,}", " ", text)
    return text

def parse_entry(raw: str) -> dict:
    text = " ".join(raw.split())
    note = None
    m = re.search(r"\(([^)]+)\)\s*$", text)
    if m:
        note = m.group(1).strip()
        text = text[: m.start()].strip()

    parts = [p.strip() for p in text.split(",") if p.strip()]
    word = parts[0] if parts else text
    alts = parts[1:]
    return {"word": word, "altSpellings": alts, "note": note}


SENTENCE_PAIRS = [
    (
        "The class listened for the word {w} and then wrote it from memory.",
        "A second example used {w} so the meaning would stay clear.",
    ),
    (
        "Please spell {w} after you hear it, without looking at any letters.",
        "The helper sentence still includes {w} in ordinary classroom talk.",
    ),
    (
        "Our coach said {w} slowly, then paused so everyone could write.",
        "Try this extra cue: picture a story that needs the word {w}.",
    ),
    (
        "In UIL practice, {w} is spoken first, then used in a full sentence.",
        "If you missed it, listen again for {w} before you pick up your pencil.",
    ),
    (
        "The pronouncer used {w} in a kid-friendly sentence from school life.",
        "Parents can replay the phrase that quietly hides the spelling of {w}.",
    ),
    (
        "Write {w} neatly as soon as the spoken word and sentence are finished.",
        "Another spoken clue keeps {w} in a short, easy-to-hear sentence.",
    ),
    (
        "Today's round includes {w}, so wait for the sentence before you start.",
        "The backup sentence repeats {w} without showing it on the screen.",
    ),
    (
        "A clear voice named {w}, then gave a sentence for extra context.",
        "Think of every letter while you hear {w} one more time.",
    ),
]


def sentences_for(word: str, note: str | None, idx: int) -> tuple[str, str]:
    w = word
    if note:
        s1 = f"Spell {w} in this sense: {note}."
        s2 = f"Do not confuse it with a look-alike; this {w} is the {note} meaning."
        return s1, s2
    a, b = SENTENCE_PAIRS[idx % len(SENTENCE_PAIRS)]
    extra = SENTENCE_PAIRS[(idx * 5 + 3) % len(SENTENCE_PAIRS)][1]
    return a.format(w=w), extra.format(w=w)


def extract_pages(pdf: Path) -> str:
    reader = PdfReader(str(pdf))
    chunks = []
    for page in reader.pages[5:]:  # word lists start on page 6
        text = page.extract_text() or ""
        chunks.append(text)
    return "\n".join(chunks)


def split_grade_blocks(full: str) -> dict[str, str]:
    positions = []
    for key, pat in GRADE_MARKERS.items():
        m = pat.search(full)
        if not m:
            raise SystemExit(f"Missing grade marker {key}")
        positions.append((m.start(), key))
    positions.sort()
    blocks = {}
    for i, (start, key) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(full)
        blocks[key] = full[start:end]
    return blocks


TEMPLATE_MARKERS = (
    "Please spell",
    "UIL practice",
    "pronouncer",
    "without looking at any letters",
    "helper sentence",
    "spoken clue",
    "practice round",
)


def is_template_sentence(text: str) -> bool:
    return any(marker.lower() in (text or "").lower() for marker in TEMPLATE_MARKERS)


def load_sentence_overlay(list_key: str) -> dict[int, dict]:
    overlay: dict[int, dict] = {}
    jobs = OUT_DIR / "sentence-jobs"
    if jobs.exists():
        for path in sorted(jobs.glob(f"{list_key}-*.json")):
            payload = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                payload = payload.get("sentences") or []
            for row in payload:
                overlay[int(row["id"])] = row
    existing_path = OUT_DIR / f"{list_key}.json"
    if existing_path.exists():
        for row in json.loads(existing_path.read_text(encoding="utf-8")):
            overlay.setdefault(int(row["id"]), row)
    return overlay


def apply_sentences(entry: dict, overlay: dict[int, dict]) -> dict:
    row = overlay.get(entry["id"])
    if not row:
        return entry
    s1 = (row.get("sentence1") or "").strip()
    s2 = (row.get("sentence2") or "").strip()
    if s1 and s2 and not is_template_sentence(s1):
        entry["sentence1"] = s1
        entry["sentence2"] = s2
    return entry


def parse_block(block: str) -> list[dict]:
    block = normalize_list_text(block)
    cleaned_lines = []
    for line in block.splitlines():
        if NOISE_RE.search(line) and not ENTRY_RE.search(line):
            continue
        cleaned_lines.append(line)
    text = "\n".join(cleaned_lines)
    matches = list(ENTRY_RE.finditer(text))
    entries = []
    for i, m in enumerate(matches):
        n = int(m.group(1))
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        raw = text[m.end() : end].strip()
        parsed = parse_entry(raw)
        s1, s2 = sentences_for(parsed["word"], parsed["note"], n)
        entries.append(
            {
                "id": n,
                "word": parsed["word"],
                "altSpellings": parsed["altSpellings"],
                "note": parsed["note"],
                "sentence1": s1,
                "sentence2": s2,
            }
        )
    return entries


def main() -> None:
    full = extract_pages(PDF_PATH)
    blocks = split_grade_blocks(full)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lists = {}
    for key, block in blocks.items():
        entries = parse_block(block)
        overlay = load_sentence_overlay(key)
        entries = [apply_sentences(entry, overlay) for entry in entries]
        lists[key] = entries
        out = OUT_DIR / f"{key}.json"
        out.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{key}: {len(entries)} words -> {out}")
        if entries:
            print("  first:", entries[0]["word"])
            print("  last:", entries[-1]["word"])
        missing = []
        expected = entries[-1]["id"] if entries else 0
        have = {e["id"] for e in entries}
        for i in range(1, expected + 1):
            if i not in have:
                missing.append(i)
        if missing:
            print("  MISSING ids:", missing[:30], "count", len(missing))


if __name__ == "__main__":
    main()
