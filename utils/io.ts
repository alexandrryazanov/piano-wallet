import * as readline from "readline";

// Создаем интерфейс для чтения ввода с консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Функция для асинхронного запроса с выводом на консоль
export const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};
