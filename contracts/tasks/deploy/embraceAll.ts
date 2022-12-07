import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSpace } from "../../scripts/utils";
import { EmbraceAccounts } from "../../types/contracts/EmbraceAccounts";
import { EmbraceApps } from "../../types/contracts/EmbraceApps";
import { EmbraceSpaces } from "../../types/contracts/EmbraceSpaces";
import { AppCreations } from "../../types/contracts/app/AppCreations";
import { EmbraceAccounts__factory } from "../../types/factories/contracts/EmbraceAccounts__factory";
import { EmbraceApps__factory } from "../../types/factories/contracts/EmbraceApps__factory";
import { EmbraceSpaces__factory } from "../../types/factories/contracts/EmbraceSpaces__factory";
import { AppCreations__factory } from "../../types/factories/contracts/app/AppCreations__factory";
import { EmbraceSpace } from "../frontend/utils/types";

task("deploy:EmbraceAll").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );

  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(deployer).deploy();
  await embraceAccounts.deployed();

  console.log(`NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS="${embraceAccounts.address}"`);

  // DEPLOY CREATIONS CONTRACT
  const creationsFactory: AppCreations__factory = <AppCreations__factory>(
    await ethers.getContractFactory("AppCreations")
  );
  const creations: AppCreations = <AppCreations>await creationsFactory.connect(deployer).deploy();
  await creations.deployed();
  console.log(`NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS="${creations.address}"`);

  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(deployer).deploy();
  await embraceApps.deployed();
  console.log(`NEXT_PUBLIC_APPS_CONTRACT_ADDRESS="${embraceApps.address}"`);

  // name: string, contractAddress: string
  const apps = [
    {
      name: "Chat Server",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
    },
    {
      name: "Social",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
    },
    {
      name: "Creations",
      contractAddress: creations.address,
    },
  ];

  for (let j = 0; j < apps.length; j++) {
    const app = apps[j];

    if (app) {
      const enabled = true;

      await embraceApps.createApp(app.name, app.contractAddress, enabled, {
        gasLimit: 1000000,
      });

      console.log(`Created app ${app.name}`);
    }
  }

  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>(
    await embraceSpacesFactory.connect(deployer).deploy(embraceAccounts.address, embraceApps.address)
  );
  await embraceSpaces.deployed();
  console.log(`NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS="${embraceSpaces.address}"`);

  // CREATE SPACES
  const spaces = [
    "public",
    "public-gated",
    "private-gated",
    "private-closed",
    "private-closed-reqs",
    "anon",
    "creations-space",
  ];
  const metadata = "bafkreifbf2e6vs56fp76wpnzy6rduaguusnmr4m3kcaeekbj2s4acgxkem";
  for (let i = 0; i < spaces.length; i++) {
    const space = getSpace(spaces[i], spaces[i], metadata) as EmbraceSpace;

    if (space) {
      await embraceSpaces.createSpace(space.handle, space.visibility, space.membership, space.apps, space.metadata, {
        gasLimit: 1000000,
      });

      console.log(`Created space ${space.handle}`);
    }
  }
});
