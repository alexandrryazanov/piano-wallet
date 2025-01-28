import { askChoice, askQuestion } from "./utils/io";
import { getWalletsFromDir } from "./utils/files";
import { attemptToCheckWallet, sendTransaction } from "./utils/wallet";
import { JsonRpcProvider } from "ethers";

async function send() {
  const wallets = await getWalletsFromDir();
  const walletNumber = await askChoice("Выберите кошелек:", wallets);
  const from = wallets[walletNumber - 1];
  console.log(`Выбран кошелек ${from}`);

  const to = await askQuestion("Введите адрес получателя:");

  const value = await askQuestion(
    "Введите сумму перевода (дробную часть отделите точкой):",
  );

  const provider = new JsonRpcProvider(
    "https://mainnet.infura.io/v3/acef02994c93451fa2e5b39038e2af27",
  );
  const wallet = (await attemptToCheckWallet(from)).connect(provider);
  const confirmTx = await askQuestion(
    `Отправить ${value}ETH с кошелька ${from} на ${to}? y/(n)`,
  );
  if (confirmTx.toLowerCase() === "y") {
    await sendTransaction(wallet, to, value);
  }
}

send().then(() => process.exit());
