import { askChoice, askQuestion, checkPassword } from "../../../utils/io";
import { getWalletsFromDir } from "../../../utils/files";
import { attemptToCheckWallet } from "../../../utils/wallet";
import { JsonRpcProvider, Wallet } from "ethers";
import { styleText } from "node:util";
import { checkETHWallet, sendETHTransaction } from "../utils";
import { NETWORK } from "../../../types";

async function send() {
  console.log("Вы собираетесь отправить средства!");
  const wallets = await getWalletsFromDir(NETWORK.ETHEREUM);
  const walletNumber = await askChoice("Выберите кошелек:", wallets);
  const from = wallets[walletNumber - 1];
  console.log(`Выбран кошелек ${from}`);

  const to = await askQuestion("Введите адрес получателя:");

  const value = await askQuestion(
    "Введите сумму перевода (дробную часть отделите точкой):",
  );

  const password = await checkPassword({ needConfirm: false });

  const provider = new JsonRpcProvider(
    "https://mainnet.infura.io/v3/acef02994c93451fa2e5b39038e2af27",
  );
  const keypair = await attemptToCheckWallet((melodyArray) =>
    checkETHWallet(from, melodyArray, password),
  );
  const wallet = new Wallet(keypair.privateKey, provider);
  const confirmTx = await askQuestion(
    styleText(
      ["yellow"],
      `Отправить ${value}ETH с кошелька ${from} на ${to}? y/(n)`,
    ),
  );
  if (confirmTx.toLowerCase() === "y") {
    await sendETHTransaction(wallet, to, value);
  }
}

send().then(() => process.exit());
