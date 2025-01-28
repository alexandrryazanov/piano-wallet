import crypto from "crypto";

// Генерируем список чисел заданной длинные из любого массива чисел
export function generateNumbers(
  inputString: string,
  count: number = 24,
  rangeMin: number = 1,
  rangeMax: number = 1000,
): number[] {
  let hashBuffer = crypto
    .createHash("sha256")
    .update(inputString)
    .digest("hex");

  const uniqueNumbers = new Set<number>(); // Уникальные числа
  let i = 0;

  while (uniqueNumbers.size < count) {
    // Проверяем, не вышли ли мы за длину текущего хэша
    if (i * 4 >= hashBuffer.length) {
      // Если хэша не хватает, пересчитываем новый хэш с добавлением индекса
      hashBuffer += crypto
        .createHash("sha256")
        .update(hashBuffer + i)
        .digest("hex");
    }

    // Берём 4 символа (2 байта) из хэша
    const segment = hashBuffer.slice(i * 4, (i + 1) * 4);
    const num = parseInt(segment, 16); // Преобразуем в десятичное число
    const scaledNum = rangeMin + (num % (rangeMax - rangeMin + 1)); // Масштабируем в диапазон

    uniqueNumbers.add(scaledNum); // Добавляем только уникальные числа
    i++;

    // Защита от зависания (предел попыток)
    if (i > hashBuffer.length * 4) {
      throw new Error("Не удалось сгенерировать достаточно уникальных чисел.");
    }
  }

  return Array.from(uniqueNumbers);
}
