import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { EmbraceSpaces } from "../../types/EmbraceSpaces";
import type { EmbraceSpaces__factory } from "../../types/factories/EmbraceSpaces__factory";

task("deploy:EmbraceSpaces").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>await embraceSpacesFactory.connect(signers[0]).deploy();
  await embraceSpaces.deployed();
  console.log("EmbraceSpaces deployed to: ", embraceSpaces.address);
});
