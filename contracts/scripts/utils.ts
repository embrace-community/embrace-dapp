import { ethers } from "ethers";

function getWallet(): ethers.Wallet {
  // This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
  // Do never expose your keys like this
  const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

  const isUsingMnemonic = process.env.MNEMONIC && process.env.MNEMONIC.length > 0;
  const path = `m/44'/60'/0'/0/0`; // change last 0 for using a different account

  console.log(isUsingMnemonic);

  const wallet = isUsingMnemonic
    ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC!, path)
    : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);

  return wallet;
}

function getSignerProvider(
  wallet: ethers.Wallet,
  network: string,
): {
  provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider;
  signer: ethers.Wallet;
} {
  let provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider;
  if (network === "localhost") {
    provider = new ethers.providers.JsonRpcProvider();
  } else {
    provider = ethers.providers.getDefaultProvider(network);
  }
  const signer = wallet.connect(provider);

  return { provider, signer };
}

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

export { getWallet, getSignerProvider, convertStringArrayToBytes32 };
