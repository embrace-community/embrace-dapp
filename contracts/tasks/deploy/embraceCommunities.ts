import { getNetwork } from "@ethersproject/providers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSignerProvider } from "../../scripts/utils";
import type { EmbraceCommunities } from "../../types/contracts/EmbraceCommunities";
import type { EmbraceCommunity } from "../../types/contracts/EmbraceCommunity";
import type { EmbraceCommunities__factory } from "../../types/factories/contracts/EmbraceCommunities__factory";
import type { EmbraceCommunity__factory } from "../../types/factories/contracts/EmbraceCommunity__factory";

task("deploy:EmbraceCommunities")
  .addParam("accountsaddress")
  .setAction(async function (_taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const deployer = signers[0];

    // Step 1: Deploy EmbraceCommunity contract which will be cloned to create new communities
    const embraceCommunityFactory: EmbraceCommunity__factory = <EmbraceCommunity__factory>(
      await ethers.getContractFactory("EmbraceCommunity")
    );

    const embraceCommunity: EmbraceCommunity = <EmbraceCommunity>(
      await embraceCommunityFactory.connect(deployer).deploy()
    );
    await embraceCommunity.deployed();
    console.log("embraceCommunity Clone contract deployed to: ", embraceCommunity.address);

    // Step 2: Deploy main EmbraceCommunities contract
    const embraceCommunitiesFactory: EmbraceCommunities__factory = <EmbraceCommunities__factory>(
      await ethers.getContractFactory("EmbraceCommunities")
    );

    const embraceCommunities: EmbraceCommunities = <EmbraceCommunities>(
      await embraceCommunitiesFactory
        .connect(deployer)
        .deploy(`Embrace 22`, `EMBRACE_22`, _taskArguments.accountsaddress, embraceCommunity.address)
    );
    await embraceCommunities.deployed();
    console.log("embraceCommunities deployed to: ", embraceCommunities.address);
  });
