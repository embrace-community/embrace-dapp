import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "../utils";

// npx ts-node scripts/communities/get

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "polygonMumbai";

  const wallet = getWallet();
  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const communityId = await contract.getCommunities();

  console.log(`Communities:`, communityId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
