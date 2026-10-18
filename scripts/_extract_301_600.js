const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync("D:/github/spellingBee7004/src/data/grades-3-4.json", "utf8")
);
const items = data.filter((x) => x.id >= 301 && x.id <= 600);
console.log(items.length);
console.log("first", items[0].id, items[0].word);
console.log("last", items[items.length - 1].id, items[items.length - 1].word);
console.log("notes/alts:");
for (const x of items) {
  if (x.note || (x.altSpellings && x.altSpellings.length)) {
    console.log(x.id, x.word, x.note, JSON.stringify(x.altSpellings));
  }
}
console.log("---WORDS---");
for (const x of items) {
  console.log(`${x.id}\t${x.word}\t${x.note || ""}`);
}
