import { askChoice, askQuestion } from "../../../utils/io";
import { getWalletsFromDir } from "../../../utils/files";
import { attemptToCheckWallet } from "../../../utils/wallet";
import { JsonRpcProvider, Wallet } from "ethers";
import { styleText } from "node:util";
import { checkETHWallet, sendETHTransaction } from "../utils";
import { NETWORK } from "../../../types";

async function send() {
  console.log(
    `Вы собираетесь отправить средства в сети ${NETWORK.ETHEREUM}! Пока отключите интернет!`,
  );
  const wallets = await getWalletsFromDir(NETWORK.ETHEREUM);
  const walletNumber = await askChoice("Выберите кошелек:", wallets);
  const from = wallets[walletNumber - 1];
  console.log(`Выбран кошелек ${from}`);

  const to = await askQuestion("Введите адрес получателя:");

  const value = await askQuestion(
    "Введите сумму перевода в ETH (дробную часть отделите точкой):",
  );

  const provider = new JsonRpcProvider(
    "https://mainnet.infura.io/v3/acef02994c93451fa2e5b39038e2af27",
  );
  const keypair = await attemptToCheckWallet((melody, pwd) =>
    checkETHWallet(from, melody, pwd),
  );
  const wallet = new Wallet(keypair.privateKey, provider);
  const confirmTx = await askQuestion(
    styleText(
      ["yellow"],
      `Отправить ${value}ETH с кошелька ${from} на ${to}? Подключитесь к сети, нажмите Y и Enter.`,
    ),
  );
  if (confirmTx.toLowerCase() === "y") {
    await sendETHTransaction(wallet, to, value);
  }
}

send().then(() => process.exit());
