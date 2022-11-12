import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceAccounts from "../artifacts/contracts/EmbraceAccounts.sol/EmbraceAccounts.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getAccountSpaces 0xd45439023cf4E47A1d6423c321a9f8C22Be47d41 0x725Acc62323480E9565fBbfAC8573908e4EEF883 evmosTestnet

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    throw new Error("Contract address needs to be specified.");
  }

  const memberAddress = process.argv[3];
  if (!memberAddress) {
    throw new Error("MemberAddress needs to be specified.");
  }

  const network = process.argv[4] || "localhost";

  const wallet = getWallet();

  const { signer } = getSignerProvider(wallet, network);

  const contract = new ethers.Contract(contractAddress, EmbraceAccounts.abi, signer);

  const spaces = await contract.getSpaces(memberAddress);

  console.log(`Spaces: ${spaces}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
