import json

with open(r"D:\github\spellingBee7004\src\data\grades-5-6.json", encoding="utf-8") as f:
    data = json.load(f)

items = [x for x in data if 1 <= x["id"] <= 400]
print(len(items))
print("first", items[0]["id"], items[0]["word"])
print("last", items[-1]["id"], items[-1]["word"])
ids = [x["id"] for x in items]
print("missing", [i for i in range(1, 401) if i not in ids])
for x in items:
    note = x.get("note")
    alts = x.get("altSpellings") or []
    extra = ""
    if note:
        extra += f" | NOTE={note}"
    if alts:
        extra += f" | alts={alts}"
    print(f"{x['id']}\t{x['word']}{extra}")
