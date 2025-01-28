import midi from "midi";
import * as readline from "node:readline";
import { generateMnemonic, wordlists } from "bip39";
import { shuffleArray } from "./utils/lists";
import { encrypt } from "./utils/crypt";
import { ethers } from "ethers";
import { generateNumbers } from "./utils/numbers";
import { writeWordsToFile } from "./utils/files";

// Создаем новый объект Input для подключения к MIDI-устройствам
const input = new midi.Input();

// Проверяем, сколько устройств подключено
const devicesCount = input.getPortCount();

// Если устройства доступны, подключаемся к первому устройству
if (devicesCount < 1) {
  console.log("Нет доступных MIDI-устройств.");
  process.exit();
}

input.openPort(0); // Подключение к первому устройству (0 — это индекс порта)

console.log("Создание кошелька. Начни играть...");

const keys: number[] = [];

input.on("message", (deltaTime, message) => {
  const [command, note, velocity] = message;
  if (command !== 144 || velocity <= 0) return; // Если это не сообщение типа "Note On"
  if (keys.length === 0) {
    console.log("🎹 Сигнал поступает! Когда закончите нажмите Enter.");
  }
  keys.push(note);
});

// Создаем интерфейс для чтения ввода с консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Слушаем событие 'line', которое возникает при вводе строки
rl.on("line", async (input) => {
  if (input === "") {
    // Проверяем, что введена пустая строка (нажат Enter)
    if (keys.length < 5) {
      console.log("Мелодия слишком коротка! =(");
      rl.close();
      process.exit(1);
    }

    await createWallet();
    rl.close();
    process.exit();
  }
});

async function createWallet() {
  const TOTAL_WORDS = 500;
  const melodyString = keys.join("-");
  const shuffledWords = shuffleArray(wordlists["EN"]).slice(0, TOTAL_WORDS - 1);
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

  await writeWordsToFile(encryptedWords, wallet.address);

  console.log("Кошелек создан. Адрес:", wallet.address);
}
