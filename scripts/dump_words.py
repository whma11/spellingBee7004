import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "data"
OUT = ROOT / "sentence-jobs"
OUT.mkdir(parents=True, exist_ok=True)

for name in ("grades-3-4.json", "grades-5-6.json", "grades-7-8.json"):
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    lines = []
    for e in data:
        extra = []
        if e.get("altSpellings"):
            extra.append("alts=" + ",".join(e["altSpellings"]))
        if e.get("note"):
            extra.append("note=" + e["note"])
        suffix = f"\t{'; '.join(extra)}" if extra else ""
        lines.append(f"{e['id']}\t{e['word']}{suffix}")
    (OUT / name.replace(".json", "-words.txt")).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(name, len(data))
