import "dotenv/config";
import { ethers } from "ethers";

import * as AppCreations from "../artifacts/contracts/app/AppCreations.sol/AppCreations.json";
import { getSignerProvider, getWallet } from "./utils";

const CREATIONS_CONTRACT_ADDRESS = "0x04Bc5F294Ec6027E1e21AFaCD96E86cEc7B573B5";

// npx ts-node scripts/getSpaceCollections

async function main() {
  const spaceId = process.argv[2] || 1;
  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(CREATIONS_CONTRACT_ADDRESS, AppCreations.abi, signer);

  const collections = await contract.getCollections(spaceId);

  console.log(`Collections: ${collections.length}`);

  for (let index = 0; index < collections.length; index++) {
    console.log(`======Collection Index #${index}======`);
    console.log(collections[index]);
    console.log("\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
