import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { MembershipGateType, MembershipType, Visibility } from "./../test/types";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/createSpace 0x7f59Bc766Eb5A0263C0D00B4EF33B62671Bd6A38 Embrace.community bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli

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

  const spaceType = process.argv[6] || "public";

  const space = getSpace(spaceType, handle, metadata);

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceSpaces.abi, signer);

  console.log("space", space);

  if (space) {
    await contract.createSpace(
      formatBytes32String(space.handle),
      space.visibility,
      space.membership,
      space.apps,
      space.metadata,
    );

    const spaces = await contract.getSpaces();
    console.log(`Space created, there are currently ${spaces.length}, ${JSON.stringify(spaces[spaces.length - 1])}`);
  } else {
    console.log(`No space object`);
  }
}

const getSpace = (spaceType: any, handle: string, metadata: string) => {
  if (spaceType == "public") {
    return {
      handle,
      visibility: Visibility.PUBLIC,
      membership: {
        kind: MembershipType.OPEN,
        gate: { gateType: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-gated") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        kind: MembershipType.GATED,
        gate: {
          gateType: MembershipGateType.ERC20,
          tokenAddress: ethers.constants.AddressZero,
        },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-closed") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        kind: MembershipType.CLOSED,
        gate: { gateType: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
        allowRequests: true,
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "anon") {
    return {
      handle,
      visibility: Visibility.ANONYMOUS,
      membership: {
        kind: MembershipType.CLOSED,
        gate: { gateType: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps: [0],
      metadata,
    };
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
