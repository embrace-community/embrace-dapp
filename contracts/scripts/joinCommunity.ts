import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import * as EmbraceCommunity from "../artifacts/contracts/EmbraceCommunity.sol/EmbraceCommunity.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getCommunitiesData

async function main() {
  const handle = process.argv[2] || "embrace";

  const contractAddress = process.argv[3] || "0xe20e68B46a180AfbaAbFc319aCD0b8960197599d";

  const network = process.argv[4] || "polygonMumbai";
  // const network = process.argv[4] || "localhost";

  const wallet = getWallet();
  const { signer } = getSignerProvider(wallet, network);

  // const wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
  // const { signer } = getSignerProvider(wallet, "localhost");

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const community = await embraceCommunitiesContract.handleToCommunity(handle);

  console.log(`Community:`, community);

  if (community.id) {
    const tokenURI = await embraceCommunitiesContract.tokenURI(community.id);

    const embraceCommunityContract = new ethers.Contract(community.contractAddress, EmbraceCommunity.abi, signer);

    await embraceCommunityContract.join();
    console.log("Joined community");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
