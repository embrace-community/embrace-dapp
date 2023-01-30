import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceCommunities from "../artifacts/contracts/EmbraceCommunities.sol/EmbraceCommunities.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getCommunitiesData

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) throw new Error("No contract address provided.");

  const network = process.argv[3] || "polygonMumbai";

  const handle = process.argv[4] || "embrace";

  let wallet = getWallet();

  if (network === "localhost") {
    wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
  }

  const { signer } = getSignerProvider(wallet, network);

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

  try {
    await tx.wait();
  } catch (err) {
    // console.log({ err });

    console.log("Transaction Hash...", (err as any).transaction.data);
    // const code = (err as any).data.replace("Reverted ", "");
    // let reason = ethers.utils.toUtf8String("0x" + code.substr(138));
    // console.log("revert reason:", reason);
  }

  console.log("Community created!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
