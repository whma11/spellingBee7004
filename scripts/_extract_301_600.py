import json

with open(r"D:\github\spellingBee7004\src\data\grades-3-4.json", encoding="utf-8") as f:
    data = json.load(f)

items = [x for x in data if 301 <= x["id"] <= 600]
print(len(items))
print("first", items[0]["id"], items[0]["word"])
print("last", items[-1]["id"], items[-1]["word"])
print("notes/alts:")
for x in items:
    if x.get("note") or x.get("altSpellings"):
        print(x["id"], x["word"], x.get("note"), x.get("altSpellings"))
print("---WORDS---")
for x in items:
    print(f"{x['id']}\t{x['word']}\t{x.get('note') or ''}")
