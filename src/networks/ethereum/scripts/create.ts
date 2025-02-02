import { writeWordsToFile } from "../../../utils/files";
import { askQuestion, checkPassword } from "../../../utils/io";
import { attemptToCheckWallet } from "../../../utils/wallet";
import { listenMelody } from "../../../utils/midi";
import { styleText } from "node:util";
import { checkETHWallet, createETHWallet } from "../utils";
import { NETWORK } from "../../../types";

async function create() {
  console.log("Вы собираетесь создать новый кошелек!");
  console.log(styleText("red", "‼️ВНИМАНИЕ: отключите все соединения!"));

  let melodyArray = await listenMelody();

  const password = await checkPassword({ needConfirm: true });

  const { keypair, words } = createETHWallet(melodyArray, password);
  await writeWordsToFile(words, NETWORK.ETHEREUM, keypair.publicKey);

  const answerOnCheckWallet = await askQuestion(
    "Хотите проверить доступ к кошельку? y/(n)",
  );

  if (answerOnCheckWallet.toLowerCase() === "y") {
    await attemptToCheckWallet((melody, pwd) =>
      checkETHWallet(keypair.publicKey, melody, pwd),
    );
  }
}

create().then(() => process.exit());
