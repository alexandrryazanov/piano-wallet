import { ethers, Wallet } from "ethers";
import { shuffleArray } from "./lists";
import { generateMnemonic, wordlists } from "bip39";
import { decrypt, encrypt } from "./crypt";
import { generateNumbers } from "./numbers";
import { getWordsFromFile } from "./files";
import { askQuestion } from "./io";

const TOTAL_WORDS = 500;

export const generateMelodyString = (keys: number[]) => keys.join("-");

export function createWallet(melodyArray: number[]) {
  const melodyString = generateMelodyString(melodyArray);
  const shuffledWords = shuffleArray(wordlists["EN"]).slice(0, TOTAL_WORDS);
  const encryptedWords = shuffledWords.map((word) =>
    encrypt(word, melodyString),
  );
  const mnemonic = generateMnemonic(256); // 256 бит — это 24 слова
  const mnemonicWords = mnemonic.split(" ");
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  const positions = generateNumbers(
    melodyString,
    mnemonicWords.length,
    0,
    TOTAL_WORDS - 1,
  );
  mnemonicWords.forEach((word, i) => {
    encryptedWords[positions[i]] = encrypt(word, melodyString); // Шифруем каждое слово и кладем вместо существующего на позицию из списка сгенерированных позиций
  });

  console.log("Кошелек создан. Адрес:", wallet.address);

  return { address: wallet.address, words: encryptedWords };
}

export async function getWalletFromFile(
  filename: string,
  melodyArray: number[],
) {
  const words = await getWordsFromFile(filename);
  const melodyString = generateMelodyString(melodyArray);
  const positions = generateNumbers(melodyString, 24, 0, TOTAL_WORDS - 1);
  const mnemonic = positions
    .reduce<
      string[]
    >((acc, position) => [...acc, decrypt(words[position], melodyString)], [])
    .join(" ");

  const node = ethers.Wallet.fromPhrase(mnemonic);
  return new Wallet(node.privateKey);
}

export async function checkWallet(address: string, melodyArray: number[]) {
  const wallet = await getWalletFromFile(address, melodyArray);
  if (wallet.address !== address) throw new Error("Check failed");
}

export async function attemptToCheckWallet(
  walletAddress: string,
  melodyArray: number[],
) {
  melodyArray.length = 0; // Очищаем массив мелодии

  await askQuestion("Сыграйте ту же мелодию. Нажмите Enter по окончанию...");

  try {
    await checkWallet(walletAddress, melodyArray);
    console.log("Проверка прошла успешно!");
  } catch (e) {
    console.log("Проверка не удалась. Попробуйте еще!");
    await attemptToCheckWallet(walletAddress, melodyArray);
  }
}

export async function sendTransaction(
  wallet: Wallet,
  to: string,
  ethValue: string,
) {
  const tx = {
    to, // Адрес получателя
    value: ethers.parseEther(ethValue), // Сумма для перевода в эфире (разделена точкой)
  };

  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log("Sent:", txResponse.hash);
    await txResponse.wait();
    console.log("Approved ✅");
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
  }
}
