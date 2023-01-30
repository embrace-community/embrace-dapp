import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import * as EmbraceCommunity from "../artifacts/contracts/EmbraceCommunity.sol/EmbraceCommunity.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getCommunitiesData

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "polygonMumbai";

  const handle = process.argv[4] || "embrace";

  const wallet = getWallet();
  const { signer } = getSignerProvider(wallet, network);

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const community = await embraceCommunitiesContract.handleToCommunity(handle);

  console.log(`Community:`, community);

  if (community.id) {
    const tokenURI = await embraceCommunitiesContract.tokenURI(community.id);

    const embraceCommunityContract = new ethers.Contract(community.contractAddress, EmbraceCommunity.abi, signer);

    const tables = await embraceCommunityContract.getTables();
    const contractData = await embraceCommunityContract.getCommunityData();

    const founder = await embraceCommunityContract.getFounder();

    console.log(`Token URI:`, tokenURI);
    console.log(`Tables:`, tables);
    console.log(`Contract Data:`, contractData);
    console.log(`Founder:`, founder);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
