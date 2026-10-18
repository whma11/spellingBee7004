import json

with open(r"D:\github\spellingBee7004\src\data\grades-7-8.json", encoding="utf-8") as f:
    data = json.load(f)

items = [x for x in data if 451 <= x["id"] <= 900]
print(len(items))
print(items[0]["id"], items[-1]["id"])
for x in items:
    note = x.get("note") or ""
    alts = x.get("altSpellings") or []
    extra = ""
    if note:
        extra += f" | note={note}"
    if alts:
        extra += f" | alts={alts}"
    print(f"{x['id']}\t{x['word']}{extra}")
