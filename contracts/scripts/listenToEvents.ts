import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/listenToEvents 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 evmosTestnet

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const network = process.argv[3] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  contract.on("SpaceCreated", (spaceId, founder) => {
    console.log(`SpaceCreated: ${spaceId} ${founder}`);
  });

  contract.on("JoinedSpace", (spaceId, memberAddress, isAdmin) => {
    console.log(`JoinedSpace: ${spaceId} ${memberAddress} ${isAdmin}`);
  });

  contract.on("RequestJoinSpace", (spaceId, memberAddress) => {
    console.log(`RequestJoinSpace: ${spaceId} ${memberAddress}`);
  });

  contract.on("RemovedFromSpace", (spaceId, memberAddress) => {
    console.log(`RemovedFromSpace: ${spaceId} ${memberAddress}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
