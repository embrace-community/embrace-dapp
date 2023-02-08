import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceSpaces from "../../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { spacesContract } from "../../envs";
import { getSignerProvider, getWallet } from "../utils";

// npx ts-node scripts/setSpaceMember spaceId memberAddress isActive isAdmin network?
// npx ts-node scripts/setSpaceMember 3 0xB64A31a65701f01a1e63844216f3DbbCC9b3cF2C

async function main() {
  const spaceId = process.argv[2];
  if (!spaceId) {
    throw new Error("Space Id needs to be specified.");
  }

  const memberAddress = process.argv[3];
  if (!memberAddress) {
    throw new Error("MemberAddress needs to be specified.");
  }

  const isActive = process.argv[4] || true;
  const isAdmin = process.argv[5] || false;

  const network = process.argv[6] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(spacesContract, EmbraceSpaces.abi, signer);

  const member = await contract.setMember(spaceId, memberAddress, isActive, isAdmin);

  console.log(`Member: ${member}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
