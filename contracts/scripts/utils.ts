import { ethers } from "ethers";

import { Access, MembershipGateToken, Visibility } from "../test/types";

function getWallet(walletNum: number = 0): ethers.Wallet {
  // This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
  // Do never expose your keys like this
  const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

  const isUsingMnemonic = process.env.MNEMONIC && process.env.MNEMONIC.length > 0;
  const path = `m/44'/60'/0'/0/${walletNum}`; // change last 0 for using a different account

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
  } else if (network === "evmosTestnet") {
    provider = new ethers.providers.JsonRpcProvider("https://eth.bd.evmos.dev:8545");
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

const chainLinkAddressGoerli = "0x326c977e6efc84e512bb9c30f76e30c160ed06fb";

function getSpace(spaceType: any, handle: string, metadata: string) {
  if (spaceType == "public") {
    return {
      handle,
      visibility: Visibility.PUBLIC,
      membership: {
        access: Access.OPEN,
        gate: { token: MembershipGateToken.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "public-gated") {
    return {
      handle,
      visibility: Visibility.PUBLIC,
      membership: {
        access: Access.GATED,
        gate: {
          token: MembershipGateToken.ERC20,
          tokenAddress: chainLinkAddressGoerli,
        },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-gated") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        access: Access.GATED,
        gate: {
          token: MembershipGateToken.ERC20,
          tokenAddress: chainLinkAddressGoerli,
        },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-closed") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        access: Access.CLOSED,
        gate: { token: MembershipGateToken.NONE, tokenAddress: ethers.constants.AddressZero },
        allowRequests: false,
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-closed-reqs") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        access: Access.CLOSED,
        gate: { token: MembershipGateToken.NONE, tokenAddress: ethers.constants.AddressZero },
        allowRequests: true,
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "anon") {
    return {
      handle,
      visibility: Visibility.ANONYMOUS,
      membership: {
        access: Access.CLOSED,
        gate: { token: MembershipGateToken.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps: [0],
      metadata,
    };
  }
}

export { getWallet, getSignerProvider, convertStringArrayToBytes32, getSpace };
