import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSignerProvider } from "../../scripts/utils";
import type { EmbraceCommunities } from "../../types/contracts/EmbraceCommunities";
import type { EmbraceCommunities__factory } from "../../types/factories/contracts/EmbraceCommunities__factory";

task("deploy:EmbraceCommunities")
  .addParam("accountsaddress")
  .setAction(async function (_taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const deployer: SignerWithAddress = signers[0];
    // const wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
    // const { signer: deployer } = getSignerProvider(wallet, "localhost");

    const embraceCommunitiesFactory: EmbraceCommunities__factory = <EmbraceCommunities__factory>(
      await ethers.getContractFactory("EmbraceCommunities")
    );

    // const tablelandRegistryAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Local Dev
    const tablelandRegistryAddress = "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68"; // Mumbai

    const embraceCommunities: EmbraceCommunities = <EmbraceCommunities>(
      await embraceCommunitiesFactory
        .connect(deployer)
        .deploy("Embrace Communities", "EMBRACE_COMMUNITIES", _taskArguments.accountsaddress, tablelandRegistryAddress)
    );
    await embraceCommunities.deployed();
    console.log("embraceCommunities deployed to: ", embraceCommunities.address);

    const tableName = await embraceCommunities.getTableName();
    console.log("tableName: ", tableName);
  });
