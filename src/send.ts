import { askChoice, askQuestion } from "./utils/io";
import { getWalletsFromDir } from "./utils/files";
import { attemptToCheckWallet, sendTransaction } from "./utils/wallet";
import { JsonRpcProvider } from "ethers";

async function send() {
  const wallets = await getWalletsFromDir();
  const walletNumber = await askChoice("Выберите кошелек:", wallets);
  const address = wallets[walletNumber - 1];
  const to = await askQuestion("Введите адрес получателя:");
  const value = await askQuestion(
    "Введите сумму перевода (дробную часть отделите точкой):",
  );
  const provider = new JsonRpcProvider(
    "https://mainnet.infura.io/v3/acef02994c93451fa2e5b39038e2af27",
  );
  const wallet = (await attemptToCheckWallet(address)).connect(provider);
  await sendTransaction(wallet, to, value);
}

send().then(() => process.exit());
