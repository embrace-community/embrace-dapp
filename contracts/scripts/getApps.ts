import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceApps from "../artifacts/contracts/EmbraceApps.sol/EmbraceApps.json";
import { getSignerProvider, getWallet } from "./utils";

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
  console.log(`There are currently ${apps.length} apps, ${JSON.stringify(apps[apps.length - 1])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
