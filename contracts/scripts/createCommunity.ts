import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/createCommunity

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "polygonMumbai";

  const handle = process.argv[4] || "embrace";

  const contractData = getContractData(handle);

  const metaData = getMetaData(handle);

  let wallet;

  if (network === "localhost") {
    wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
    console.log(`Using address ${wallet.address}`);
  } else {
    wallet = getWallet();
  }

  const { signer } = getSignerProvider(wallet, network);

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const tx = await embraceCommunitiesContract.createCommunity(handle, contractData, metaData, {
    gasLimit: 1500000,
  });

  console.log(`Community being created...`);

  try {
    await tx.wait();
  } catch (err) {
    console.log({ err });
    return;
  }

  console.log("Community created!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function getContractData(handle: string) {
  return {
    handle,
    visibility: 0,
    membership: {
      access: 0,
      gate: {
        tokenType: 0,
        tokenAddress: ethers.constants.AddressZero,
        tokenId: 0, // ERC1155 only
      },
    },
    apps: [0, 1],
  };
}

function getMetaData(handle: string) {
  return {
    handle,
    name: "Embrace",
    description: "Embrace is a community of people who are passionate about the future of the web3 ecosystem.",
    image: "https://bafkreifpwbuljas66omawzeqv2ivry2lmxyslcfucwqhgltzk7ob2xudum.ipfs.w3s.link/",
  };
}
