import json
from pathlib import Path

data = json.loads(Path(r"D:\github\spellingBee7004\src\data\grades-7-8.json").read_text(encoding="utf-8"))
rows = [e for e in data if 1 <= e["id"] <= 450]
print(len(rows))
print(rows[0]["id"], rows[-1]["id"])
print("---notes/alts---")
for e in rows:
    if e.get("note") or e.get("altSpellings"):
        print((e["id"], e["word"], e.get("note"), e.get("altSpellings")))
print("---all words---")
for e in rows:
    print(f"{e['id']}\t{e['word']}")
