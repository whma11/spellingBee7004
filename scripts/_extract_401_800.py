import json

with open(r"D:\github\spellingBee7004\src\data\grades-5-6.json", encoding="utf-8") as f:
    data = json.load(f)

items = [x for x in data if 401 <= x["id"] <= 800]
print(len(items))
print("first", items[0]["id"], repr(items[0]["word"]))
print("last", items[-1]["id"], repr(items[-1]["word"]))
ids = [x["id"] for x in items]
print("min", min(ids), "max", max(ids), "unique", len(set(ids)))
missing = [i for i in range(401, 801) if i not in set(ids)]
print("missing", missing)

for x in items:
    note = x.get("note") or ""
    alts = x.get("altSpellings") or []
    extra = ""
    if note:
        extra += f" NOTE={note}"
    if alts:
        extra += f" ALTS={alts}"
    print(f"{x['id']}\t{x['word']}{extra}")
