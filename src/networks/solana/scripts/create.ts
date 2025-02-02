import { styleText } from "node:util";
import { NETWORK } from "../../../types";
import { listenMelody } from "../../../utils/midi";
import { askQuestion, checkPassword } from "../../../utils/io";
import { checkSOLWallet, createSOLWallet } from "../utils";
import { writeWordsToFile } from "../../../utils/files";
import { attemptToCheckWallet } from "../../../utils/wallet";

async function create() {
  console.log(`Вы собираетесь создать новый кошелек ${NETWORK.SOLANA}!`);
  console.log(styleText("red", "‼️ВНИМАНИЕ: отключите все соединения!"));

  let melodyArray = await listenMelody();

  const password = await checkPassword({ needConfirm: true });

  const { keypair, words } = await createSOLWallet(melodyArray, password);
  await writeWordsToFile(words, NETWORK.SOLANA, keypair.publicKey);

  const answerOnCheckWallet = await askQuestion(
    "Хотите проверить доступ к кошельку? y/(n)",
  );

  if (answerOnCheckWallet.toLowerCase() === "y") {
    await attemptToCheckWallet((melody, pwd) =>
      checkSOLWallet(keypair.publicKey, melody, pwd),
    );
  }
}

create().then(() => process.exit());
