import { ethers, Wallet } from "ethers";
import { shuffleArray } from "./lists";
import { generateMnemonic, wordlists } from "bip39";
import { decrypt, encrypt } from "./crypt";
import { generateNumbers } from "./numbers";
import { getWordsFromFile } from "./files";
import { listenMelody } from "./midi";

const TOTAL_WORDS = 500;
export const MNEMONIC_LENGTH = 24;

export const generateMelodyString = (keys: number[]) => keys.join("-");

export function createWallet(melodyArray: number[]) {
  const melodyString = generateMelodyString(melodyArray);
  const shuffledWords = shuffleArray(wordlists["EN"]).slice(0, TOTAL_WORDS);
  const encryptedWords = shuffledWords.map((word) =>
    encrypt(word, melodyString),
  );
  const mnemonic = generateMnemonic(256); // 256 бит = 24 слова (переворачиваем для безопасности)
  const mnemonicWords = mnemonic.split(" ");
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  const positions = generateNumbers(
    melodyString,
    MNEMONIC_LENGTH,
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
  const positions = generateNumbers(
    melodyString,
    MNEMONIC_LENGTH,
    0,
    TOTAL_WORDS - 1,
  );
  const mnemonic = positions
    .reduce<
      string[]
    >((acc, position) => [...acc, decrypt(words[position], melodyString)], [])
    .join(" ");

  const node = ethers.Wallet.fromPhrase(mnemonic);
  console.log("Доступ к кошельку разрешен!");
  return new Wallet(node.privateKey);
}

export async function checkWallet(address: string, melodyArray: number[]) {
  try {
    const wallet = await getWalletFromFile(address, melodyArray);
    if (wallet.address !== address) return null;
    return wallet;
  } catch (e) {
    return null;
  }
}

export async function attemptToCheckWallet(walletAddress: string) {
  const melodyArray = await listenMelody();
  const wallet = await checkWallet(walletAddress, melodyArray);
  if (!wallet) {
    console.log("Проверка не удалась. Попробуйте еще!");
    return await attemptToCheckWallet(walletAddress);
  }
  return wallet;
}

export async function sendTransaction(
  wallet: Wallet,
  to: string,
  ethValue: string,
) {
  console.log(`Отсылаем ${ethValue}ETH на адрес ${to}...`);
  try {
    const txResponse = await wallet.sendTransaction({
      to, // Адрес получателя
      value: ethers.parseEther(ethValue), // Сумма для перевода в эфире (разделена точкой)
    });
    console.log(
      `Транзакция ${txResponse.hash} отправлена. Дождитесь завершения...`,
    );
    await txResponse.wait();
    console.log("Транзакция подтверждена ✅");
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
  }
}
