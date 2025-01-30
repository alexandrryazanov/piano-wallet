import { askChoice, askQuestion, checkPassword } from "../../../utils/io";
import { getWalletsFromDir } from "../../../utils/files";
import { styleText } from "node:util";
import { NETWORK } from "../../../types";
import { attemptToCheckWallet } from "../../../utils/wallet";
import { checkSOLWallet, sendSOLTransaction } from "../utils";

async function send() {
  console.log(`Вы собираетесь отправить средства в сети ${NETWORK.SOLANA}!`);
  const wallets = await getWalletsFromDir(NETWORK.SOLANA);
  const walletNumber = await askChoice("Выберите кошелек:", wallets);
  const from = wallets[walletNumber - 1];
  console.log(`Выбран кошелек ${from}`);

  const to = await askQuestion("Введите адрес получателя:");

  const value = await askQuestion(
    "Введите сумму перевода (дробную часть отделите точкой):",
  );

  const password = await checkPassword({ needConfirm: false });

  const keypair = await attemptToCheckWallet((melodyArray) =>
    checkSOLWallet(from, melodyArray, password),
  );

  const confirmTx = await askQuestion(
    styleText(
      ["yellow"],
      `Отправить ${value}SOL с кошелька ${from} на ${to}? y/(n)`,
    ),
  );
  if (confirmTx.toLowerCase() === "y") {
    await sendSOLTransaction(keypair.privateKey, to, +value);
  }
}

send().then(() => process.exit());
