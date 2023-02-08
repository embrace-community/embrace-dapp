import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import * as AppCreationsCollection from "../../artifacts/contracts/app/AppCreationsCollection.sol/AppCreationsCollection.json";
import { getSpace } from "../../scripts/utils";
import { EmbraceAccounts } from "../../types/contracts/EmbraceAccounts";
import { EmbraceApps } from "../../types/contracts/EmbraceApps";
import { EmbraceCommunities } from "../../types/contracts/EmbraceCommunities";
import { EmbraceCommunity } from "../../types/contracts/EmbraceCommunity";
import { EmbraceSpaces } from "../../types/contracts/EmbraceSpaces";
import { AppCreations } from "../../types/contracts/app/AppCreations";
import { AppSocials } from "../../types/contracts/app/AppSocials";
import { EmbraceAccounts__factory } from "../../types/factories/contracts/EmbraceAccounts__factory";
import { EmbraceApps__factory } from "../../types/factories/contracts/EmbraceApps__factory";
import { EmbraceCommunities__factory } from "../../types/factories/contracts/EmbraceCommunities__factory";
import { EmbraceCommunity__factory } from "../../types/factories/contracts/EmbraceCommunity__factory";
import { EmbraceSpaces__factory } from "../../types/factories/contracts/EmbraceSpaces__factory";
import { AppCreations__factory } from "../../types/factories/contracts/app/AppCreations__factory";
import { AppSocials__factory } from "../../types/factories/contracts/app/AppSocials__factory";

// import { EmbraceSpace } from "../frontend/utils/types";

task("deploy:EmbraceAll").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];
  // const wrongDeployer: SignerWithAddress = signers[1];

  const accountsContract = await _deployAccounts(deployer, ethers);
  const appsContract = await _deployApps(deployer, ethers);
  const spacesContract = await _deploySpaces(deployer, ethers, accountsContract.address);
  const creationsContract = await _deployCreations(deployer, ethers, spacesContract.address);
  const socialsContract = await _deploySocials(deployer, ethers, spacesContract.address);

  const embraceCommunity = await _deployEmbraceCommunity(deployer, ethers);
  const embraceCommunities = await _deployEmbraceCommunities(
    deployer,
    ethers,
    accountsContract.address,
    embraceCommunity.address,
  );

  _createApps(ethers, appsContract, creationsContract);
  // _createSpaces(ethers, spacesContract, accountsContract, appsContract);
  // _createCollections(deployer, ethers, creationsContract);
});

async function _deployAccounts(deployer: SignerWithAddress, ethers: any) {
  // DEPLOY ACCOUNTS CONTRACT
  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );

  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(deployer).deploy();
  await embraceAccounts.deployed();

  console.log(`NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS="${embraceAccounts.address}"`);

  return embraceAccounts;
}

async function _deployApps(deployer: SignerWithAddress, ethers: any) {
  // DEPLOY APPS CONTRACT
  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(deployer).deploy();
  await embraceApps.deployed();

  console.log(`NEXT_PUBLIC_APPS_CONTRACT_ADDRESS="${embraceApps.address}"`);

  return embraceApps;
}

async function _deploySpaces(deployer: SignerWithAddress, ethers: any, accountsContractAddress: string) {
  // DEPLOY SPACES CONTRACT
  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>(
    await embraceSpacesFactory.connect(deployer).deploy(accountsContractAddress)
  );
  await embraceSpaces.deployed();

  console.log(`NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS="${embraceSpaces.address}"`);

  return embraceSpaces;
}

async function _deployCreations(deployer: SignerWithAddress, ethers: any, spacesContractAddress: string) {
  // DEPLOY CREATIONS CONTRACT
  const creationsFactory: AppCreations__factory = <AppCreations__factory>(
    await ethers.getContractFactory("AppCreations")
  );
  const creations: AppCreations = <AppCreations>await creationsFactory.connect(deployer).deploy(spacesContractAddress);
  await creations.deployed();
  console.log(`NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS="${creations.address}"`);

  return creations;
}

async function _deploySocials(deployer: SignerWithAddress, ethers: any, spacesContractAddress: string) {
  // DEPLOY SOCIALS CONTRACT
  const socialsFactory: AppSocials__factory = <AppSocials__factory>await ethers.getContractFactory("AppSocials");
  const socials: AppSocials = <AppSocials>await socialsFactory.connect(deployer).deploy(spacesContractAddress);
  await socials.deployed();

  console.log(`NEXT_PUBLIC_SOCIALS_CONTRACT_ADDRESS="${socials.address}"`);

  return socials;
}

async function _deployEmbraceCommunity(deployer: SignerWithAddress, ethers: any) {
  // Step 1: Deploy EmbraceCommunity contract which will be cloned to create new communities
  const embraceCommunityFactory: EmbraceCommunity__factory = <EmbraceCommunity__factory>(
    await ethers.getContractFactory("EmbraceCommunity")
  );

  const embraceCommunity: EmbraceCommunity = <EmbraceCommunity>await embraceCommunityFactory.connect(deployer).deploy();
  await embraceCommunity.deployed();

  console.log(`NEXT_PUBLIC_COMMUNITY_CONTRACT_ADDRESS="${embraceCommunity.address}"`);

  return embraceCommunity;
}

async function _deployEmbraceCommunities(
  deployer: SignerWithAddress,
  ethers: any,
  accountsContractAddress: string,
  embraceCommunityAddress: string,
) {
  // Step 2: Deploy main EmbraceCommunities contract
  const embraceCommunitiesFactory: EmbraceCommunities__factory = <EmbraceCommunities__factory>(
    await ethers.getContractFactory("EmbraceCommunities")
  );

  const embraceCommunities: EmbraceCommunities = <EmbraceCommunities>(
    await embraceCommunitiesFactory
      .connect(deployer)
      .deploy(`Embrace Community`, `EMBRACE`, accountsContractAddress, embraceCommunityAddress)
  );
  await embraceCommunities.deployed();

  console.log(`NEXT_PUBLIC_COMMUNITIES_CONTRACT_ADDRESS="${embraceCommunities.address}"`);

  return embraceCommunities;
}

async function _createApps(ethers: any, appsContract: EmbraceApps, creationsContract: AppCreations) {
  // CREATE APPS
  const apps = [
    {
      name: "Social", // Default name on UI
      contractAddress: ethers.constants.AddressZero, // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Creations",
      contractAddress: creationsContract.address,
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
      await appsContract.createApp(app.name, app.contractAddress, app.enabled, {
        gasLimit: 1000000,
      });

      console.log(`Created app ${app.name}`);
    }
  }
}

async function _createSpaces(ethers: any, spacesContract: EmbraceSpaces, accountsContract: EmbraceAccounts) {
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
    const space = getSpace(spaces[i], spaces[i], metadata); //as EmbraceSpace;

    if (space) {
      // const spaceId = await spacesContract.createSpace(
      //   space.handle,
      //   space.visibility,
      //   // space.access,
      //   // space.membershipGate,
      //   space.apps,
      //   space.metadata,
      //   {
      //     gasLimit: 1000000,
      //   },
      // );

      console.log(`Created space ${space.handle}`);

      if (space.members && space.members.length > 0) {
        // Set the members
        for (let j = 0; j < space.members.length; j++) {
          const member = space.members[j];
          const spaceId = i + 1; // as the spaceId returned from contract call is not returned correctly
          await spacesContract.setMember(spaceId, member, true, true, {
            gasLimit: 1000000,
          }); // Makes active and Admin
          console.log(`Added member ${member} to space ${space.handle} / ${spaceId}`);
        }
      }
    }
  }
}

async function _createCollections(deployer: SignerWithAddress, ethers: any, creations: AppCreations) {
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
}
