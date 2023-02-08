import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "../utils";

// npx ts-node scripts/communities/create

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "localhost";
  const handle = process.argv[4] || "embrace";

  const wallet = getWallet();
  const { signer } = getSignerProvider(wallet, network);

  const communityData = getCommunityData(handle);

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const tx = await embraceCommunitiesContract.createCommunity(handle, communityData, {
    gasLimit: 1500000,
  });

  console.log(`Community being created...`);

  try {
    await tx.wait();
  } catch (err) {
    console.log({ err });
    return;
  }

  console.log("Community created!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function getCommunityData(handle: string) {
  return {
    handle,
    visibility: 0,
    access: 0,
    membershipGate: {
      tokenType: 0,
      tokenAddress: ethers.constants.AddressZero,
      tokenId: 0, // ERC1155 only
    },
    apps: [0, 1],
    metadata: "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
  };
}
