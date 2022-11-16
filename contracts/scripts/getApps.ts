import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceApps from "../artifacts/contracts/EmbraceApps.sol/EmbraceApps.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getApps 0x99d397319B258b0400129467ba4827799680D6B5 polygonMumbai

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceApps.abi, signer);

  const apps = await contract.getApps();
  console.log(`There are currently ${apps.length} apps, ${JSON.stringify(apps)}`);
  console.log(apps);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
