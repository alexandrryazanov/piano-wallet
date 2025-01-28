import { ethers, Wallet } from "ethers";

// const passphrase = "your_passphrase_here";
// import { generateMnemonic } from "bip39";

// Генерируем 24-словную мнемоническую фразу с использованием bip39
// const mnemonic = generateMnemonic(256); // 256 бит — это 24 слова

// // Создаем кошелек из мнемонической фразы
// const wallet = ethers.Wallet.fromPhrase(mnemonic);
//
// // Используем passphrase для получения приватного ключа
// /*const encryptedWallet = */
// wallet
//   .encrypt(passphrase)
//   .then((json) => {
//     const walletFromPassphrase = ethers.Wallet.fromEncryptedJsonSync(
//       json,
//       passphrase,
//     );
//
//     console.log("Seed фраза (24 слова):", mnemonic);
//     console.log("Публичный адрес:", walletFromPassphrase.address);
//   })
//   .catch((error) => {
//     console.error("Ошибка при создании кошелька:", error);
//   });

// Указываем RPC URL (например, Infura или другой провайдер)
// const provider = new ethers.JsonRpcProvider(
//   "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
// );

// get wallet from mnemonicPhrase and passphrase
// const mnemonicPhrase =
//   "... enact long bacon oppose heart adapt segment island quantum soup forum";

export async function sendTransaction(
  wallet: Wallet,
  to: string,
  ethValue: string,
) {
  const tx = {
    to, // Адрес получателя
    value: ethers.parseEther(ethValue), // Сумма для перевода в эфире
  };

  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log("Sent:", txResponse.hash);
    await txResponse.wait();
    console.log("Approved ✅");
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
  }
}
