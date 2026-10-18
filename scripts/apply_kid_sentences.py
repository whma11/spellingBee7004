"""Merge kid-friendly sentence jobs into the word JSON lists."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
JOBS = DATA / "sentence-jobs"


def load_jobs(prefix: str) -> dict[int, dict]:
    merged: dict[int, dict] = {}
    if not JOBS.exists():
        return merged
    for path in sorted(JOBS.glob(f"{prefix}-*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            payload = payload.get("sentences") or payload.get("words") or []
        for row in payload:
            merged[int(row["id"])] = row
    return merged


def apply_list(filename: str) -> None:
    prefix = filename.replace(".json", "")
    jobs = load_jobs(prefix)
    path = DATA / filename
    words = json.loads(path.read_text(encoding="utf-8"))
    missing = []
    updated = 0
    for entry in words:
        row = jobs.get(entry["id"])
        if not row:
            missing.append(entry["id"])
            continue
        s1 = (row.get("sentence1") or "").strip()
        s2 = (row.get("sentence2") or "").strip()
        if not s1 or not s2:
            missing.append(entry["id"])
            continue
        entry["sentence1"] = s1
        entry["sentence2"] = s2
        updated += 1
    path.write_text(json.dumps(words, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{filename}: updated {updated}/{len(words)}; missing {len(missing)}")
    if missing[:20]:
        print("  first missing ids:", missing[:20])


def main() -> None:
    for name in ("grades-3-4.json", "grades-5-6.json", "grades-7-8.json"):
        apply_list(name)


if __name__ == "__main__":
    main()
