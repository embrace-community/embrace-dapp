import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/joinSpace 0x9d36D68d99281A868B2daE74645784f6cd47c4Fa 0 1 goerli

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const spaceIndex = process.argv[3];
  if (!spaceIndex) {
    throw new Error("Space Index needs to be specified.");
  }

  const walletNum = Number(process.argv[4]) || 0;

  const network = process.argv[5] || "localhost";

  const wallet = getWallet(walletNum);

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  console.log(`Joining space ${spaceIndex} with address ${signer.address}`);

  // attempt to join the space
  // Gas limit included to avoid gas issues error
  const joinSpace = await contract.joinSpace(0, { gasLimit: 1000000000 });

  console.log(`Join space transaction hash: ${joinSpace.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
