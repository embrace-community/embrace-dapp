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

  const appIndex = process.argv[3];
  if (!appIndex) {
    throw new Error("App index needs to be specified.");
  }

  const metadata = process.argv[4];
  if (!metadata) {
    throw new Error("App metadata needs to be specified.");
  }

  const network = process.argv[5] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceApps.abi, signer);

  await contract.updateMetadata(appIndex, metadata);

  const app = await contract.getAppByIndex(appIndex);
  console.log(`App updated ${JSON.stringify(app)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
