import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceApps from "../artifacts/contracts/EmbraceApps.sol/EmbraceApps.json";
import { getSignerProvider, getWallet } from "./utils";

// COMMANDS TO CREATE APPS
// npx ts-node scripts/createApp 0xE300bF5B76671A5C702F9E48B8e5e91cE8C8C282 CHAT 0xE300bF5B76671A5C702F9E48B8e5e91cE8C8C282 metadata polygonMumbai

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const code = process.argv[3];
  if (!code) {
    throw new Error("App code needs to be specified.");
  }

  const appsAddress = process.argv[4];
  if (!appsAddress) {
    throw new Error("App address needs to be specified.");
  }

  const network = process.argv[6] || "localhost";

  const app = {
    code: code, // now stored as string for easy readibility
    contractAddress: appsAddress,
    enabled: true,
  };

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceApps.abi, signer);

  await contract.createApp(app.code, app.contractAddress, app.enabled);

  const apps = await contract.getApps();
  console.log(`App created, there are currently ${apps.length}, ${JSON.stringify(apps[apps.length - 1])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
