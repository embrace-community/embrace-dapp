import "dotenv/config";
import { ethers } from "ethers";

import * as AppCreations from "../../artifacts/contracts/app/AppCreations.sol/AppCreations.json";
import { creationsContract } from "../../envs";
import { getSignerProvider, getWallet } from "../utils";

// npx ts-node scripts/createCollection

async function main() {
  const spaceId = process.argv[2] || 1;
  const name = process.argv[3] || "VIDEO BLOG";
  const symbol = process.argv[4] || "VLOG";
  const network = process.argv[5] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  // console.log("Creations App Contract addess", creationsContract);
  // console.log(spaceId, name, symbol);

  const contract = new ethers.Contract(creationsContract, AppCreations.abi, signer);

  await contract.createCollection(spaceId, name, symbol, {
    gasLimit: 8000000, // approx 0.01 ETH
  });

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
