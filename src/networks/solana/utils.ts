import {
  createMnemonicAndWords,
  getMnemonicFromFile,
} from "../../utils/wallet";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NETWORK } from "../../types";

const DERIVE_PATH = "m/44'/501'/0'/0'";

export async function createSOLWallet(melodyArray: number[], password: string) {
  const { words, mnemonic } = createMnemonicAndWords(melodyArray, password);

  const seed = await mnemonicToSeed(mnemonic);
  const derivedSeed = derivePath(DERIVE_PATH, seed.toString("hex")).key;
  const keypair = Keypair.fromSeed(derivedSeed);

  console.log("Кошелек создан. Адрес:", keypair.publicKey.toBase58());

  return {
    keypair: {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: keypair.secretKey,
    },
    words,
  };
}

export async function checkSOLWallet(
  address: string,
  melodyArray: number[],
  password: string,
) {
  try {
    const mnemonic = await getMnemonicFromFile(
      NETWORK.SOLANA,
      address,
      melodyArray,
      password,
    );
    const seed = await mnemonicToSeed(mnemonic);
    const derivedSeed = derivePath(DERIVE_PATH, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derivedSeed);

    if (keypair.publicKey.toBase58() !== address) return null;
    return {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: keypair.secretKey,
    };
  } catch (e) {
    return null;
  }
}

export async function sendSOLTransaction(
  secretKey: Uint8Array,
  to: string,
  solValue: number,
) {
  console.log(`Отсылаем ${solValue}SOL на адрес ${to}...`);
  try {
    const senderKeypair = Keypair.fromSecretKey(secretKey);
    const fromPublicKey = new PublicKey(senderKeypair.publicKey.toBase58());
    const toPublicKey = new PublicKey(to);
    const connection = new Connection(
      clusterApiUrl("mainnet-beta"),
      "confirmed",
    );
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: solValue * 1_000_000_000, // (1 SOL = 1e9 lamports)
      }),
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      senderKeypair,
    ]);
    console.log(`Транзакция ${signature} отправлена...`);
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
  }
}
