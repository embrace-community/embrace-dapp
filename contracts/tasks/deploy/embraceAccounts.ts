import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { EmbraceAccounts } from "../../types/EmbraceAccounts";
import type { EmbraceAccounts__factory } from "../../types/factories/EmbraceAccounts__factory";

task("deploy:EmbraceAccounts").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );

  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(signers[0]).deploy();
  await embraceAccounts.deployed();

  console.log("EmbraceAccounts deployed to: ", embraceAccounts.address);
});
