import * as readline from "readline";

// Создаем интерфейс для чтения ввода с консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Функция для асинхронного запроса с выводом на консоль
export const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      resolve(answer);
    });
  });
};

// Функция для вывода вариантов и ожидания выбора
export const askChoice = (
  question: string,
  options: string[],
): Promise<number> => {
  return new Promise((resolve) => {
    console.log(question);

    // Отображаем список вариантов
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    // Спрашиваем пользователя
    rl.question("Введите номер варианта: ", (answer) => {
      const choice = parseInt(answer, 10);

      // Проверяем, что выбор валиден
      if (isNaN(choice) || choice < 1 || choice > options.length) {
        console.log("Неверный выбор. Попробуйте снова.");
        resolve(askChoice(question, options)); // Переспрашиваем
      } else {
        resolve(choice); // Возвращаем номер выбранного варианта
      }
    });
  });
};
