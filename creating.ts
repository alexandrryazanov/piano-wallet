import midi from "midi";
import { words } from "./words";
import { encrypt } from "./crypt";
import { generateMnemonic } from "bip39";
import { ethers } from "ethers";

// Создаем новый объект Input для подключения к MIDI-устройствам
const input = new midi.Input();

// Проверяем, сколько устройств подключено
const count = input.getPortCount();
console.log(`Подключено ${count} MIDI-устройств.`);

// Если устройства доступны, подключаемся к первому устройству
if (count > 0) {
  input.openPort(0); // Подключение к первому устройству (0 — это индекс порта)

  const uniqueNotesSet = new Set<number>();

  console.log("Ожидание MIDI-сообщений...");
  // Обработчик входящих MIDI-сообщений
  input.on("message", (deltaTime, message) => {
    const command = message[0];
    const note = message[1];
    const velocity = message[2];

    // Если это сообщение типа "Note On"
    if (command === 144 && velocity > 0) {
      uniqueNotesSet.add(note);
    }

    if (uniqueNotesSet.size === 24) {
      const uniqueNotes = [...uniqueNotesSet].toSorted((a, b) => a - b);
      const key = uniqueNotes.join("");

      // Шифруем все слова с кодом из мелодии
      const encryptedWords: string[] = [];
      for (const word of Object.values(words)) {
        encryptedWords.push(encrypt(word, key));
      }

      console.log("All words encrypted");

      // создаем кошелек
      const mnemonic = generateMnemonic(256); // 256 бит — это 24 слова
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      console.log("Address", wallet.address);
      console.log("\n");

      // Шифруем каждое слово и кладем вместо существующего на позицию ноты из мелодии
      const mnemonicWords = mnemonic.split(" ");
      mnemonicWords.forEach((word, i) => {
        encryptedWords[uniqueNotes[i]] = encrypt(word, key);
      });

      console.log(encryptedWords.map((w) => `"${w}"`).join(","));
      process.exit();
    }
  });
} else {
  console.log("Нет доступных MIDI-устройств.");
}
