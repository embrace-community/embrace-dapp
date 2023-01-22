import "dotenv/config";
import { ethers } from "ethers";

import * as EmbraceAccounts from "../artifacts/contracts/EmbraceAccounts.sol/EmbraceAccounts.json";
import { getSignerProvider, getWallet } from "./utils";

// npx ts-node scripts/getAccountSpaces 0x5402B6E1726138234C43ddd2cfD25cdBd28F3169 0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC evmosTestnet

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
