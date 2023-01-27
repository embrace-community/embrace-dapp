import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getCommunitiesData

async function main() {
  const contractAddress = "0x322813fd9a801c5507c9de605d63cea4f2ce6c44";

  const network = process.argv[2] || "localhost";

  // Table land owner Private Key
  const wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const communityData = await contract.getCommunitiesData();

  console.log(`communityData: ${communityData}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
