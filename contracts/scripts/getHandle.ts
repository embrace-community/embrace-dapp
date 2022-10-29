import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceAccounts from "../artifacts/contracts/EmbraceAccounts.sol/EmbraceAccounts.json";
import { getSignerProvider, getWallet } from "./utils";

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const whichAddress = process.argv[3];
  if (!whichAddress) {
    throw new Error("Address to get handle needs to be specified.");
  }
  const network = process.argv[4] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceAccounts.abi, signer);

  const handle = await contract.getHandle(whichAddress);

  console.log(`Found handle is ${handle}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
