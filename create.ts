import midi from "midi";
import { writeWordsToFile } from "./utils/files";
import { askQuestion } from "./utils/io";
import { attemptToCheckWallet, createWallet } from "./utils/wallet";

async function app() {
  // Создаем новый объект Input для подключения к MIDI-устройствам
  const input = new midi.Input();

  // Проверяем, сколько устройств подключено
  const devicesCount = input.getPortCount();

  // Если устройства доступны, подключаемся к первому устройству
  if (devicesCount < 1) {
    console.log("Нет доступных MIDI-устройств.");
    process.exit();
  }

  // Подключение к первому устройству (0 — это индекс порта)
  input.openPort(0);

  console.log("💶 Создание кошелька. Начните играть...");
  const melodyArray: number[] = [];

  input.on("message", (deltaTime, message: number[]) => {
    const [command, note, velocity] = message;
    if (command !== 144 || velocity <= 0) return; // Если это не сообщение типа "Note On"
    if (melodyArray.length === 0) {
      console.log("\n🎹 Сигнал поступает! Продолжайте играть...");
    }
    melodyArray.push(note);
  });

  const answerOnFinishCreatingMelody = await askQuestion(
    "Нажмите любую букву и Enter, когда закончите мелодию...",
  );

  let walletAddress: string = "";
  if (answerOnFinishCreatingMelody) {
    if (melodyArray.length < 5) {
      console.log("Мелодия слишком коротка! =(");
      process.exit(1);
    }

    const { words, address } = createWallet(melodyArray);
    await writeWordsToFile(words, address);
    walletAddress = address;
  }

  const answerOnCheckWallet = await askQuestion(
    "Хотите проверить доступ к кошельку? y/n",
  );

  if (answerOnCheckWallet.toLowerCase() !== "y") {
    process.exit();
  }

  await attemptToCheckWallet(walletAddress, melodyArray);
  process.exit();
}

app();
