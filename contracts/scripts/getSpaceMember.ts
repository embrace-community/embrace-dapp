import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getSpaceMember 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 1 0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC goerli

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const spaceId = process.argv[3];
  if (!spaceId) {
    throw new Error("Space Index needs to be specified.");
  }

  const memberAddress = process.argv[4];
  if (!memberAddress) {
    throw new Error("MemberAddress needs to be specified.");
  }

  const network = process.argv[5] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  const member = await contract.getSpaceMember(spaceId, memberAddress);

  console.log(`Member: ${member}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
