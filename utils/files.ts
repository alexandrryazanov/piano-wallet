import * as fs from "fs/promises";

export function writeWordsToFile(words: string[], address: string) {
  return fs.writeFile(
    `./wallets/${address.substring(-4)}.json`,
    JSON.stringify({ words }, null, 2),
    { flag: "wx", encoding: "utf8" },
  );
}
