import * as fs from "fs/promises";
import { NETWORK } from "../types";

export async function writeWordsToFile(
  words: string[],
  network: NETWORK,
  filename: string,
) {
  await fs.writeFile(
    `./networks/${network}/wallets/${filename}.json`,
    JSON.stringify({ words }, null, 2),
    { flag: "wx", encoding: "utf8" },
  );

  console.log(`Слова записаны в файл ${filename}.json`);
}

export async function getWordsFromFile(network: NETWORK, filename: string) {
  const data = await fs.readFile(
    `./networks/${network}/wallets/${filename}.json`,
    {
      encoding: "utf8",
    },
  );
  const json = JSON.parse(data);
  return json.words as string[];
}

export async function getWalletsFromDir(network: NETWORK) {
  const files = await fs.readdir(`./networks/${network}/wallets/`);
  return files.map((f) => f.split(".")[0]);
}
