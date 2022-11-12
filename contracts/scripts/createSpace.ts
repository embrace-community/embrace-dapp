import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { MembershipGateType, MembershipType, Visibility } from "./../test/types";
import { getSignerProvider, getWallet } from "./utils";

// COMMANDS TO CREATE SPACES WITH DIFFERING MEMBERSHIP TYPES
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 public.open bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 public.gated bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli public-gated
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 private.closed bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli private-closed
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 private.closed.reqs bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli private-closed-reqs
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 private.gated bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli private-gated
// npx ts-node scripts/createSpace 0xBd393d1F864D888Ea915550FA4a76962927aD7D9 anon bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli anon

const chainLinkAddressGoerli = "0x326c977e6efc84e512bb9c30f76e30c160ed06fb";

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
        access: MembershipType.OPEN,
        gate: { token: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "public-gated") {
    return {
      handle,
      visibility: Visibility.PUBLIC,
      membership: {
        access: MembershipType.GATED,
        gate: {
          token: MembershipGateType.ERC20,
          tokenAddress: chainLinkAddressGoerli,
        },
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-gated") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        access: MembershipType.GATED,
        gate: {
          token: MembershipGateType.ERC20,
          tokenAddress: chainLinkAddressGoerli,
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
        access: MembershipType.CLOSED,
        gate: { token: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
        allowRequests: false,
      },
      apps: [0],
      metadata,
    };
  } else if (spaceType == "private-closed-reqs") {
    return {
      handle,
      visibility: Visibility.PRIVATE,
      membership: {
        access: MembershipType.CLOSED,
        gate: { token: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
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
        access: MembershipType.CLOSED,
        gate: { token: MembershipGateType.NONE, tokenAddress: ethers.constants.AddressZero },
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
