import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import * as AppCreationsCollection from "../../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
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

  // DEPLOY ACCOUNTS CONTRACT
  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );

  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(deployer).deploy();
  await embraceAccounts.deployed();

  console.log(`NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS="${embraceAccounts.address}"`);

  // DEPLOY APPS CONTRACT
  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(deployer).deploy();
  await embraceApps.deployed();
  console.log(`NEXT_PUBLIC_APPS_CONTRACT_ADDRESS="${embraceApps.address}"`);

  // DEPLOY SPACES CONTRACT
  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>(
    await embraceSpacesFactory.connect(deployer).deploy(embraceAccounts.address, embraceApps.address)
  );
  await embraceSpaces.deployed();
  console.log(`NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS="${embraceSpaces.address}"`);

  // DEPLOY CREATIONS CONTRACT
  const creationsFactory: AppCreations__factory = <AppCreations__factory>(
    await ethers.getContractFactory("AppCreations")
  );
  const creations: AppCreations = <AppCreations>await creationsFactory.connect(deployer).deploy();
  await creations.deployed();
  console.log(`NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS="${creations.address}"`);

  // CREATE APPS
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

  // CREATE CREATIONS COLLECTION
  const spaceId = 7;
  await creations.createCollection(spaceId, "Primary", "PRIMARY", {
    gasLimit: 8000000, // approx 0.01 ETH
  });

  await creations.createCollection(spaceId, "Video Blog", "VLOG", {
    gasLimit: 8000000, // approx 0.01 ETH
  });

  const collections = await creations.getCollections(spaceId);

  if (collections.length > 0) {
    // Add creations to the new collection
    const collectionContractAddress = collections[0].contractAddress;
    const contract = new ethers.Contract(collectionContractAddress, AppCreationsCollection.abi, deployer);
    const tokenURIs = [
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
    ];

    for (let i = 0; i < tokenURIs.length; i++) {
      await contract.mint(tokenURIs[i]);
      console.log("Minted token", i, tokenURIs[i]);
    }

    // Add creations to the new collection
    const vlogCollectionContractAddress = collections[1].contractAddress;
    const vlogContract = new ethers.Contract(vlogCollectionContractAddress, AppCreationsCollection.abi, deployer);
    const vlogTokenURIs = [
      "bafkreihis2pfkhpqwv3yznga2twatd3jlujmvnaduvk5l6icm2cyclh42y",
      "bafkreihbar4sjulb6e5kqxvqclbgy2xh7h5xb7iityeour553yskud4pwm",
    ];

    for (let i = 0; i < vlogTokenURIs.length; i++) {
      await vlogContract.mint(vlogTokenURIs[i]);
      console.log("Minted token", i, vlogTokenURIs[i]);
    }
  }
});
