import "dotenv/config";
import { ethers } from "ethers";

import * as AppCreations from "../../artifacts/contracts/app/AppCreations.sol/AppCreations.json";
import * as AppCreationsCollection from "../../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
import { creationsContract } from "../../envs";
import { getSignerProvider, getWallet } from "../utils";

// npx ts-node scripts/createCollectionCreation

async function main() {
  const spaceId = process.argv[2];
  if (!spaceId) throw new Error("Space Id is required");

  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const creations = new ethers.Contract(creationsContract, AppCreations.abi, signer);

  const collections = await creations.getCollections(spaceId);

  if (collections.length > 0) {
    // Add creations to the new collection
    const collectionContractAddress = collections[0].contractAddress;
    const contract = new ethers.Contract(collectionContractAddress, AppCreationsCollection.abi, signer);
    const tokenURIs = [
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
    ];

    for (let i = 0; i < tokenURIs.length; i++) {
      await contract.mint(tokenURIs[i]);
      console.log("Minted token", i, tokenURIs[i]);
    }

    // Add creations to the new collection
    const vlogCollectionContractAddress = collections[1].contractAddress;
    const vlogContract = new ethers.Contract(vlogCollectionContractAddress, AppCreationsCollection.abi, signer);
    const vlogTokenURIs = [
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
    ];

    for (let i = 0; i < vlogTokenURIs.length; i++) {
      await vlogContract.mint(vlogTokenURIs[i]);
      console.log("Minted token", i, vlogTokenURIs[i]);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
