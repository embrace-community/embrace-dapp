import "dotenv/config";
import { ethers } from "ethers";

import * as AppCreationsCollection from "../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/createCollectionCreation

async function main() {
  const collectionAddress = process.argv[2];
  if (!collectionAddress) throw new Error("Collection address is required");

  const tokenURI = process.argv[3];
  if (!tokenURI) throw new Error("Token URI is required");

  // const spaceId = process.argv[4] || 1;
  const network = process.argv[4] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(collectionAddress, AppCreationsCollection.abi, signer);

  await contract.mint(tokenURI);

  const tokens = await contract.getAllTokens();

  console.log(`Tokens: ${tokens.length}`);
  for (let index = 0; index < tokens.length; index++) {
    const uri = await contract.tokenURI(tokens[index]);
    const owner = await contract.ownerOf(tokens[index]);

    console.log(`======Token Index #${index}======`);
    console.log(uri);
    console.log(owner);
    console.log("\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
