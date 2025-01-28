import { writeWordsToFile } from "./utils/files";
import { askQuestion } from "./utils/io";
import { attemptToCheckWallet, createWallet } from "./utils/wallet";
import { listenMelody } from "./utils/midi";

async function create() {
  console.log("Вы собираетесь создать новый кошелек!");
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
