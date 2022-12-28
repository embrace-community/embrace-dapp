import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { AppSocials } from "../../types/contracts/app/AppSocials";
import type { AppSocials__factory } from "../../types/factories/contracts/app/AppSocials__factory";

task("deploy:AppSocials")
  .addParam("embraceSpacesAddress", "The contract address of embrace spaces")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const deployer: SignerWithAddress = signers[0];

    // Deploy the AppSocials contract - then create a collection for it
    const appSocialsFactory: AppSocials__factory = <AppSocials__factory>await ethers.getContractFactory("AppSocials");

    const appSocials: AppSocials = <AppSocials>(
      await appSocialsFactory.connect(deployer).deploy(taskArguments.embraceSpacesAddress)
    );
    await appSocials.deployed();
    console.log("AppSocials deployed to: ", appSocials.address);
  });
