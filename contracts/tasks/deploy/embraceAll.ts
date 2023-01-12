import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import * as AppCreationsCollection from "../../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
import { getSpace } from "../../scripts/utils";
import { EmbraceAccounts } from "../../types/contracts/EmbraceAccounts";
import { EmbraceApps } from "../../types/contracts/EmbraceApps";
import { EmbraceSpaces } from "../../types/contracts/EmbraceSpaces";
import { AppCreations } from "../../types/contracts/app/AppCreations";
import { AppSocials } from "../../types/contracts/app/AppSocials";
import { EmbraceAccounts__factory } from "../../types/factories/contracts/EmbraceAccounts__factory";
import { EmbraceApps__factory } from "../../types/factories/contracts/EmbraceApps__factory";
import { EmbraceSpaces__factory } from "../../types/factories/contracts/EmbraceSpaces__factory";
import { AppCreations__factory } from "../../types/factories/contracts/app/AppCreations__factory";
import { AppSocials__factory } from "../../types/factories/contracts/app/AppSocials__factory";
import { EmbraceSpace } from "../frontend/utils/types";

task("deploy:EmbraceAll").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];
  // const wrongDeployer: SignerWithAddress = signers[1];

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
  const creations: AppCreations = <AppCreations>await creationsFactory.connect(deployer).deploy(embraceSpaces.address);
  await creations.deployed();
  console.log(`NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS="${creations.address}"`);

  // DEPLOY SOCIALS CONTRACT
  const socialsFactory: AppSocials__factory = <AppSocials__factory>await ethers.getContractFactory("AppSocials");
  const socials: AppSocials = <AppSocials>await socialsFactory.connect(deployer).deploy(embraceSpaces.address);
  await socials.deployed();
  console.log(`NEXT_PUBLIC_SOCIALS_CONTRACT_ADDRESS="${socials.address}"`);

  // CREATE APPS
  const apps = [
    {
      name: "Social", // Default name on UI
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Creations",
      contractAddress: creations.address,
      enabled: true,
    },
    {
      name: "Chat Server",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Streaming",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Courses",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Pages",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Marketplace",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Discussions",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Governance",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Contributions",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Fundraising",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Events",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "Calendar",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    {
      name: "File Share",
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: false,
    },
    // {
    //   name: "Tasks",
    //   contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
    //   enabled: false,
    // },
  ];

  for (let j = 0; j < apps.length; j++) {
    const app = apps[j];

    if (app) {
      await embraceApps.createApp(app.name, app.contractAddress, app.enabled, {
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
      const spaceId = await embraceSpaces.createSpace(
        space.handle,
        space.visibility,
        space.membership,
        space.apps,
        space.metadata,
        {
          gasLimit: 1000000,
        },
      );

      console.log(`Created space ${space.handle}`);

      if (space.members && space.members.length > 0) {
        // Set the members
        for (let j = 0; j < space.members.length; j++) {
          const member = space.members[j];
          const spaceId = i + 1; // as the spaceId returned from contract call is not returned correctly
          await embraceSpaces.setMember(spaceId, member, true, true, {
            gasLimit: 1000000,
          }); // Makes active and Admin
          console.log(`Added member ${member} to space ${space.handle} / ${spaceId}`);
        }
      }
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
