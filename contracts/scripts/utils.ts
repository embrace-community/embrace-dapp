import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";

import { Access, MembershipGateToken, Visibility } from "../test/types";

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
// if (!infuraApiKey) {
//   throw new Error("Please set your INFURA_API_KEY in a .env file (utils.ts)");
// }

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
  } else {
    let chainName: string = network;
    if (network === "polygonMumbai") {
      chainName = "polygon-mumbai";
    }

    provider = new ethers.providers.JsonRpcProvider("https://" + chainName + ".infura.io/v3/" + infuraApiKey);
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
const apps = [0, 1, 2];

/*
  const apps = [
  {
    id: 1,
    title: null, // Will default to "Chat Server"
    spaceAppContractAddress: ethers.constants.AddressZero,
  },
  {
    id: 2,
    title: null, // Will default to "Social"
    spaceAppContractAddress: ethers.constants.AddressZero,
  },
  {
    id: 3,
    title: null, // Will default to "Creations"
    spaceAppContractAddress: ethers.constants.AddressZero,
  },
];
*/

function getSpace(spaceType: any, handle: string, metadata: string) {
  if (spaceType == "public") {
    return {
      handle,
      visibility: Visibility.PUBLIC,
      membership: {
        access: Access.OPEN,
        gate: { token: MembershipGateToken.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps,
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
      apps,
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
      apps,
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
      apps,
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
      apps,
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
      apps,
      metadata,
    };
  }
}

export { getWallet, getSignerProvider, convertStringArrayToBytes32, getSpace };
