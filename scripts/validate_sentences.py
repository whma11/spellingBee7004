"""Check that spoken sentences actually contain the list word."""

from __future__ import annotations

import json
import re
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "src" / "data"
BANNED = re.compile(
    r"please spell|uil practice|pronouncer|without looking at any letters",
    re.I,
)


def contains_word(sentence: str, word: str) -> bool:
    pattern = re.compile(rf"(?i)(?<![a-z]){re.escape(word)}(?![a-z])")
    return bool(pattern.search(sentence or ""))


def check(filename: str) -> None:
    words = json.loads((DATA / filename).read_text(encoding="utf-8"))
    missing = []
    templates = []
    for entry in words:
        for key in ("sentence1", "sentence2"):
            text = entry.get(key) or ""
            if not contains_word(text, entry["word"]):
                missing.append((entry["id"], entry["word"], key, text[:80]))
            if BANNED.search(text):
                templates.append((entry["id"], entry["word"], key))
    print(f"{filename}: {len(words)} words")
    print(f"  missing word in sentence: {len(missing)}")
    print(f"  leftover templates: {len(templates)}")
    for row in missing[:8]:
        print("   ", row)


if __name__ == "__main__":
    for name in ("grades-3-4.json", "grades-5-6.json", "grades-7-8.json"):
        check(name)
