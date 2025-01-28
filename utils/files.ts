import * as fs from "fs/promises";

export async function writeWordsToFile(words: string[], address: string) {
  const fileName = address.substring(-4);
  await fs.writeFile(
    `./wallets/${fileName}.json`,
    JSON.stringify({ words }, null, 2),
    { flag: "wx", encoding: "utf8" },
  );

  console.log(`Слова записаны в файл ${fileName}`);
}

export async function getWordsFromFile(filename: string) {
  const data = await fs.readFile(`./wallets/${filename}.json`, {
    encoding: "utf8",
  });
  const json = JSON.parse(data);
  return json.words as string[];
}
