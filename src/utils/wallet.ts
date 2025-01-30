import { shuffleArray } from "./lists";
import { generateMnemonic, wordlists } from "bip39";
import { decrypt, encrypt } from "./crypt";
import { generateNumbers } from "./numbers";
import { getWordsFromFile } from "./files";
import { listenMelody } from "./midi";
import { NETWORK } from "../types";

const TOTAL_WORDS = 500;
export const MNEMONIC_LENGTH = 24;

export const generateMelodyString = (keys: number[]) => keys.join("-");

export function generateAndEncryptWordsList(password: string) {
  const shuffledWords = shuffleArray(wordlists["EN"]).slice(0, TOTAL_WORDS);
  return shuffledWords.map((word) => encrypt(word, password));
}

export function encryptMnemonic(mnemonic: string, password: string) {
  const mnemonicWords = mnemonic.split(" ");
  return mnemonicWords.map((word) => encrypt(word, password));
}

function mixMnemonicToWordsList(
  encryptedMnemonicWords: string[],
  encryptedWordsList: string[],
  melodyArray: number[],
) {
  const melodyString = generateMelodyString(melodyArray);
  const positions = generateNumbers(
    melodyString,
    MNEMONIC_LENGTH,
    0,
    TOTAL_WORDS - 1,
  );

  const encryptedWordsListWithMnemonic = [...encryptedWordsList];
  encryptedMnemonicWords.forEach((encryptedMnemonicWord, i) => {
    encryptedWordsListWithMnemonic[positions[i]] = encryptedMnemonicWord; // Каждое слово кладем вместо существующего на позицию из списка сгенерированных позиций
  });

  return encryptedWordsListWithMnemonic;
}

export function createMnemonicAndWords(
  melodyArray: number[],
  password: string,
) {
  const mnemonic = generateMnemonic(256); // 256 бит = 24 слова
  const encryptedMnemonicWords = encryptMnemonic(mnemonic, password);
  const encryptedWordsList = generateAndEncryptWordsList(password);
  const words = mixMnemonicToWordsList(
    encryptedMnemonicWords,
    encryptedWordsList,
    melodyArray,
  );

  return { mnemonic, words };
}

export async function getMnemonicFromFile(
  network: NETWORK,
  filename: string,
  melodyArray: number[],
  password: string,
) {
  const words = await getWordsFromFile(network, filename);
  const melodyString = generateMelodyString(melodyArray);
  const positions = generateNumbers(
    melodyString,
    MNEMONIC_LENGTH,
    0,
    TOTAL_WORDS - 1,
  );
  const mnemonic = positions
    .reduce<
      string[]
    >((acc, position) => [...acc, decrypt(words[position], password)], [])
    .join(" ");

  console.log("Фраза кошелька расшифрована!");

  return mnemonic;
}

export async function attemptToCheckWallet(
  checkFn: (
    melodyArray: number[],
  ) => Promise<{ publicKey: string; privateKey: any } | null>,
): Promise<{ publicKey: string; privateKey: any }> {
  const melodyArray = await listenMelody();
  const wallet = await checkFn(melodyArray);
  if (!wallet) {
    console.log("Проверка не удалась. Попробуйте еще!");
    return await attemptToCheckWallet(checkFn);
  }
  console.log("Доступ к кошельку проверен!");
  return wallet;
}
