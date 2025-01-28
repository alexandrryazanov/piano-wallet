import midi from "midi";
import { encryptedWords } from "./words";
import { decrypt } from "./utils/crypt";
import { ethers, JsonRpcProvider } from "ethers";
import { sendTransaction } from "./utils/wallet";

// Создаем новый объект Input для подключения к MIDI-устройствам
const input = new midi.Input();

// Проверяем, сколько устройств подключено
const count = input.getPortCount();
console.log(`Подключено ${count} MIDI-устройств.`);

// Если устройства доступны, подключаемся к первому устройству
if (count < 1) {
  console.log("Нет доступных MIDI-устройств.");
  process.exit();
}

const NOTES_LIMIT = 24;
const uniqueNotesSet = new Set<number>();

input.openPort(0); // Подключение к первому устройству (0 — это индекс порта)
console.log("Ожидание MIDI-сообщений...");

// Обработчик входящих MIDI-сообщений
input.on("message", async (deltaTime, message) => {
  const [command, note, velocity] = message;
  if (uniqueNotesSet.size >= NOTES_LIMIT || command !== 144 || velocity <= 0)
    return; // "Note On" == 144 command msg

  uniqueNotesSet.add(note);

  if (uniqueNotesSet.size === NOTES_LIMIT) {
    const uniqueNotes = [...uniqueNotesSet].toSorted((a, b) => a - b);
    const key = uniqueNotes.join("");

    // use wallet
    const provider = new JsonRpcProvider(
      "https://mainnet.infura.io/v3/acef02994c93451fa2e5b39038e2af27",
    );

    const mnemonicPhrase = uniqueNotes
      .map((note) => decrypt(encryptedWords[note], key))
      .join(" ");

    const node = ethers.Wallet.fromPhrase(mnemonicPhrase);
    const wallet = new ethers.Wallet(node.privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log("Address", wallet.address);
    console.log("Balance (в Wei):", balance.toString());

    // try to send
    await sendTransaction(
      wallet,
      "0xe702f2765f26a7518c22209451edf731c2cb5ffc",
      "0.0015",
    );

    process.exit();
  }
});
