import crypto from "crypto";

// Функция для шифрования
export function encrypt(text, key) {
  // Хешируем ключ до 32 байтов (если он короче, он будет дополнен, если длиннее - усечен)
  const keyHash = crypto.createHash("sha256").update(key).digest();
  const iv = crypto.randomBytes(16); // Генерация случайного вектора инициализации
  const cipher = crypto.createCipheriv("aes-256-cbc", keyHash, iv); // Используем AES-256-CBC
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Возвращаем iv + зашифрованный текст
}

// Функция для расшифровки
export function decrypt(encryptedText, key) {
  const parts = encryptedText.split(":"); // Разделяем iv и зашифрованный текст
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  // Хешируем ключ до 32 байтов (если он короче, он будет дополнен, если длиннее - усечен)
  const keyHash = crypto.createHash("sha256").update(key).digest();

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyHash, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Пример использования
// const key = "837982374982347928374928479423948923483849384"; // Ваш ключ (может быть любой длины)
//
// const res: string[] = [];
// for (const word of Object.values(words)) {
//   const enc = encrypt(word, key);
//   res.push(enc);
// }
//
// console.log(res.map((w) => `"${w}"`).join(","));
