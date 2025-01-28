export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]; // Создаем копию массива, чтобы не изменять оригинал
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Случайный индекс в пределах 0...i
    [result[i], result[j]] = [result[j], result[i]]; // Меняем местами элементы
  }
  return result;
}
