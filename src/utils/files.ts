import * as fs from "fs/promises";

const WALLETS_DIR = "wallets";

export async function writeWordsToFile(words: string[], filename: string) {
  await fs.writeFile(
    `./${WALLETS_DIR}/${filename}.json`,
    JSON.stringify({ words }, null, 2),
    { flag: "wx", encoding: "utf8" },
  );

  console.log(`Слова записаны в файл ${filename}.json`);
}

export async function getWordsFromFile(filename: string) {
  const data = await fs.readFile(`./wallets/${filename}.json`, {
    encoding: "utf8",
  });
  const json = JSON.parse(data);
  return json.words as string[];
}

export async function getWalletsFromDir() {
  const files = await fs.readdir(`./${WALLETS_DIR}`);
  return files.map((f) => f.split(".")[0]);
}
