import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceApps from "../artifacts/contracts/EmbraceApps.sol/EmbraceApps.json";
import { getSignerProvider, getWallet } from "./utils";

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const appId = process.argv[3];
  if (!appId) {
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

  await contract.updateMetadata(appId, metadata);

  const app = await contract.getAppByIndex(appId);
  console.log(`App updated ${JSON.stringify(app)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
