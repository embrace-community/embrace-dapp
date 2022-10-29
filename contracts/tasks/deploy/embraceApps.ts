import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { EmbraceApps } from "../../types/EmbraceApps";
import type { EmbraceApps__factory } from "../../types/factories/EmbraceApps__factory";

task("deploy:EmbraceApps").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(signers[0]).deploy();
  await embraceApps.deployed();
  console.log("EmbraceApps deployed to: ", embraceApps.address);
});
