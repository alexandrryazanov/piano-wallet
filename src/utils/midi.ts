import midi from "midi";
import { askQuestion } from "./io";
import { styleText } from "node:util";

export async function listenMelody() {
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

  console.log(styleText(["green"], "Устройство готово... Начните играть!"));

  const melodyArray: number[] = [];
  input.on("message", (deltaTime, message: number[]) => {
    const [command, note, velocity] = message;
    if (command !== 144 || velocity <= 0) return; // Если это не сообщение типа "Note On"

    if (melodyArray.length === 0) {
      console.log("\n🎹 Сигнал поступает! Продолжайте играть...");
    }
    melodyArray.push(note);
  });

  await askQuestion(styleText(["green"], "Нажмите Enter, когда закончите..."));

  if (melodyArray.length < 5) {
    console.log("Мелодия слишком короткая! Попробуйте еще раз...");
    return await listenMelody();
  }

  return melodyArray;
}
