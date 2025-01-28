import { writeWordsToFile } from "./utils/files";
import { askQuestion } from "./utils/io";
import { attemptToCheckWallet, createWallet } from "./utils/wallet";
import { listenMelody } from "./utils/midi";
import { styleText } from "node:util";

async function create() {
  console.log("Вы собираетесь создать новый кошелек!");
  console.log(
    styleText(
      "red",
      "‼️ВНИМАНИЕ: отключите все соединения (вкл. Режим полета)!",
    ),
  );
  let melodyArray = await listenMelody();

  const { words, address } = createWallet(melodyArray);
  await writeWordsToFile(words, address);

  const answerOnCheckWallet = await askQuestion(
    "Хотите проверить доступ к кошельку? y/(n)",
  );

  if (answerOnCheckWallet.toLowerCase() === "y") {
    await attemptToCheckWallet(address);
  }
}

create().then(() => process.exit());
