import "dotenv/config";
import { ethers } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";

import * as EmbraceSpaces from "../artifacts/contracts/EmbraceSpaces.sol/EmbraceSpaces.json";
import { getSignerProvider, getSpace, getWallet } from "./utils";

// COMMANDS TO CREATE SPACES WITH DIFFERING MEMBERSHIP TYPES
// npx ts-node scripts/createSpace 0x2867f5Eb64C1efd8Cd55a03e48aC0953fd5c183F public.open bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa goerli
// npx ts-node scripts/createSpace 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 public.gated bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa evmosTestnet public-gated
// npx ts-node scripts/createSpace 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 private.closed bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa evmosTestnet private-closed
// npx ts-node scripts/createSpace 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 private.closed.reqs bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa evmosTestnet private-closed-reqs
// npx ts-node scripts/createSpace 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 private.gated bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa evmosTestnet private-gated
// npx ts-node scripts/createSpace 0x6A0Ab532FD514f7B575aC6aEfaD70f7b28fa1081 anon bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa evmosTestnet anon

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
