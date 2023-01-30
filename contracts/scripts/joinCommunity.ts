import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import * as EmbraceCommunity from "../artifacts/contracts/EmbraceCommunity.sol/EmbraceCommunity.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/joinCommunity

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "polygonMumbai";

  const handle = process.argv[4] || "embrace";

  let wallet = getWallet();

  if (network === "localhost") {
    wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
  }

  const { signer } = getSignerProvider(wallet, network);

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const community = await embraceCommunitiesContract.handleToCommunity(handle);

  console.log(`Community:`, community);

  if (community.id) {
    const tokenURI = await embraceCommunitiesContract.tokenURI(community.id);

    console.log(`Communities Token URI:`, tokenURI);

    const embraceCommunityContract = new ethers.Contract(community.contractAddress, EmbraceCommunity.abi, signer);

    const tx = await embraceCommunityContract.join();
    console.log("Joining community");

    await tx.wait();

    console.log("Joined community");

    //const memberId = await embraceCommunityContract.memberToTokenId[wallet.address];
    const memberTokenURI = await embraceCommunityContract.tokenURI(1);

    console.log(`Member Token URI 1:`, memberTokenURI);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
