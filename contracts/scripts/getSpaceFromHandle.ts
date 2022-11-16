import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getSpaceFromHandle 0x2867f5Eb64C1efd8Cd55a03e48aC0953fd5c183F public.open goerli

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  let handle = process.argv[3];
  if (!handle) {
    throw new Error("Handle needs to be specified.");
  }
  const network = process.argv[4] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  const bytes32Handle = ethers.utils.formatBytes32String(handle);

  console.log("Getting handle", handle, bytes32Handle);

  const spaceId = await contract.getIdFromHandle(bytes32Handle);
  console.log(`Found spaceId from ${handle}`, spaceId);

  const space = await contract.getSpace(spaceId);
  console.log(`Found space from ${spaceId}`, space);

  // const space = await contract.getSpaceFromHandle(bytes32Handle);
  // console.log(`Found space from ${handle}`, spaceId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
