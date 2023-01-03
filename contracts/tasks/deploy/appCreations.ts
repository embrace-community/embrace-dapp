import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { AppCreations } from "../../types/contracts/app/AppCreations";
import type { AppCreationsCollection } from "../../types/contracts/app/AppCreationsCollection";
import type { AppCreationsCollection__factory } from "../../types/factories/contracts/app/AppCreationsCollection__factory";
import type { AppCreations__factory } from "../../types/factories/contracts/app/AppCreations__factory";

task("deploy:AppCreations")
  .addParam("embraceSpacesAddress", "The contract address of embrace spaces")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const deployer: SignerWithAddress = signers[0];

    // Deploy the AppCreations contract - then create a collection for it
    const appCreationsFactory: AppCreations__factory = <AppCreations__factory>(
      await ethers.getContractFactory("AppCreations")
    );

    const appCreations: AppCreations = <AppCreations>(
      await appCreationsFactory.connect(deployer).deploy(taskArguments.embraceSpacesAddress)
    );
    await appCreations.deployed();
    console.log("AppCreations deployed to: ", appCreations.address);

    const spaceId = 1;

    // Create a collection for the AppCreations contract
    await appCreations.createCollection(spaceId, "Primary", "PRIMARY");

    const collections = await appCreations.getCollections(spaceId);
    console.log("Collections: ", collections);
  });
