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
    const deployer: SignerWithAddress = signers[0];
    const tablelandRegistryAddress = "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68"; // Mumbai

    // const wallet = new ethers.Wallet(process.env.TABLELAND_DEV_OWNER_PK ?? "");
    // const { signer: deployer } = getSignerProvider(wallet, "localhost");
    // const tablelandRegistryAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Local Dev

    // Step 1: Deploy EmbraceCommunity contract which will be cloned to create new communities
    const embraceCommunityFactory: EmbraceCommunity__factory = <EmbraceCommunity__factory>(
      await ethers.getContractFactory("EmbraceCommunity")
    );

    const embraceCommunity: EmbraceCommunity = <EmbraceCommunity>(
      await embraceCommunityFactory.connect(deployer).deploy()
    );
    await embraceCommunity.deployed();
    console.log("embraceCommunity Clone contract deployed to: ", embraceCommunity.address);

    const embraceCommunitiesFactory: EmbraceCommunities__factory = <EmbraceCommunities__factory>(
      await ethers.getContractFactory("EmbraceCommunities")
    );

    const embraceCommunities: EmbraceCommunities = <EmbraceCommunities>(
      await embraceCommunitiesFactory
        .connect(deployer)
        .deploy(
          "Embrace 0.13",
          "EMBRACE_0.13",
          _taskArguments.accountsaddress,
          embraceCommunity.address,
          tablelandRegistryAddress,
        )
    );
    await embraceCommunities.deployed();
    console.log("embraceCommunities deployed to: ", embraceCommunities.address);

    const tableName = await embraceCommunities.getTableName();
    console.log("tableName: ", tableName);
  });
