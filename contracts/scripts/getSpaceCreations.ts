import "dotenv/config";
import { BigNumber, ethers } from "ethers";

import * as AppCreations from "../artifacts/contracts/app/AppCreations.sol/AppCreations.json";
import * as AppCreationsCollection from "../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
import { creationsContract } from "../envs";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getSpaceCreations

// WILL GET ALL COLLECTIONS AND CREATIONS / NFTS FOR A SPACE
async function main() {
  const spaceId = process.argv[2] || 1;
  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(creationsContract, AppCreations.abi, signer);

  const collections = await contract.getCollections(spaceId);

  console.log(`Collections: ${collections.length}`);

  for (let index = 0; index < collections.length; index++) {
    console.log(`======Collection Index #${index}======`);

    const collectionContractAddress = collections[index].contractAddress;
    const collectionContract = new ethers.Contract(collectionContractAddress, AppCreationsCollection.abi, signer);

    const tokens = await collectionContract.getAllTokensData();

    console.log(`Tokens: ${tokens.length}`);
    for (let index = 0; index < tokens.length; index++) {
      const tokenId = BigNumber.from(tokens[index].tokenId).toNumber();
      console.log(tokenId);
      console.log(tokens[index].tokenURI);
      console.log(tokens[index].owner);

      console.log("\n");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
