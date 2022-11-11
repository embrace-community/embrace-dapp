import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { MembershipType, Visibility } from "./../test/types";
import { getSignerProvider, getWallet } from "./utils";

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const handle = process.argv[3];
  if (!handle) {
    throw new Error("Space handle needs to be specified.");
  }

  const metadata = process.argv[4];
  if (!metadata) {
    throw new Error("Space metadata needs to be specified.");
  }
  const network = process.argv[5] || "localhost";

  const space = {
    handle,
    visibility: Visibility.PUBLIC,
    membership: { kind: MembershipType.PUBLIC, tokenAddress: ethers.constants.AddressZero },
    apps: [0],
    metadata,
  };

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  console.log("space", space);

  await contract.createSpace(
    formatBytes32String(space.handle),
    space.visibility,
    space.membership,
    space.apps,
    space.metadata,
  );

  const spaces = await contract.getSpaces();
  console.log(`Space created, there are currently ${spaces.length}, ${JSON.stringify(spaces[spaces.length - 1])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
