import * as readline from "readline";
import * as process from "node:process";

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

    if (!options.length) {
      console.log("Нет вариантов для выбора!");
      process.exit();
    }

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

export const checkPassword = async ({
  needConfirm,
}: {
  needConfirm: boolean;
}): Promise<string> => {
  const password1st = await askQuestion("Введите пароль:");

  if (!needConfirm) return password1st;

  const password2nd = await askQuestion("Введите пароль еще раз:");

  if (password1st !== password2nd) {
    console.log("Пароли не совпадают! Попробуйте еще раз!");
    return await checkPassword({ needConfirm });
  }

  return password2nd;
};
