import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getSpaces 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 goerli

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  const spaces = await contract.getSpaces();

  console.log(`Spaces found, there are currently ${spaces.length}`);

  for (let index = 0; index < spaces.length; index++) {
    console.log(`======Space Index #${index}======`);
    console.log(spaces[index]);
    console.log("\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
