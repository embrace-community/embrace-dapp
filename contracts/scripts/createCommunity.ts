import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getCommunitiesData

async function main() {
  const handle = process.argv[2] || "embrace";

  const contractAddress = process.argv[3] || "0xe20e68B46a180AfbaAbFc319aCD0b8960197599d";

  const network = process.argv[4] || "polygonMumbai";
  // const network = process.argv[4] || "localhost";

  const wallet = getWallet();
  const { signer } = getSignerProvider(wallet, network);

  // const wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
  // const { signer } = getSignerProvider(wallet, "localhost");

  const embraceCommunitiesContract = new ethers.Contract(contractAddress, EmbraceCommunities.abi, signer);

  const tx = await embraceCommunitiesContract.createCommunity(
    handle,
    {
      handle,
      visibility: 0,
      membership: 0,
      apps: [0, 1],
    },
    {
      handle,
      name: "Embrace",
      description: "Embrace is a community of people who are passionate about the future of the web3 ecosystem.",
      image: "https://bafkreifpwbuljas66omawzeqv2ivry2lmxyslcfucwqhgltzk7ob2xudum.ipfs.w3s.link/",
    },
    {
      gasLimit: 15000000,
    },
  );

  console.log(`Community being created...`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
