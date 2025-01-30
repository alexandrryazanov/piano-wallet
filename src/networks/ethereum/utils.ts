import { ethers, Wallet } from "ethers";
import {
  createMnemonicAndWords,
  getMnemonicFromFile,
} from "../../utils/wallet";
import { NETWORK } from "../../types";

export function createETHWallet(melodyArray: number[], password: string) {
  const { words, mnemonic } = createMnemonicAndWords(melodyArray, password);
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  console.log("Кошелек создан. Адрес:", wallet.address);

  return {
    keypair: {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
    },
    words,
  };
}

export async function checkETHWallet(
  address: string,
  melodyArray: number[],
  password: string,
) {
  try {
    const mnemonic = await getMnemonicFromFile(
      NETWORK.ETHEREUM,
      address,
      melodyArray,
      password,
    );
    const node = ethers.Wallet.fromPhrase(mnemonic);
    if (node.address !== address) return null;
    return {
      publicKey: node.address,
      privateKey: node.privateKey,
    };
  } catch (e) {
    return null;
  }
}

export async function sendETHTransaction(
  wallet: Wallet,
  to: string,
  ethValue: string,
) {
  console.log(`Отсылаем ${ethValue}ETH на адрес ${to}...`);
  try {
    const txResponse = await wallet.sendTransaction({
      to, // Адрес получателя
      value: ethers.parseEther(ethValue), // Сумма для перевода в эфире (разделена точкой)
    });
    console.log(
      `Транзакция ${txResponse.hash} отправлена. Дождитесь завершения...`,
    );
    await txResponse.wait();
    console.log("Транзакция подтверждена ✅");
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
  }
}
