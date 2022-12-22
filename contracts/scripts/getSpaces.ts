import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { spacesContract } from "../envs";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getSpaces

async function main() {
  const network = process.argv[2] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  console.log(`Using wallet ${wallet.address} on network ${network} to get spaces at ${spacesContract}...`);

  const contract = new ethers.Contract(spacesContract, EmbraceSpaces.abi, signer);

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
