import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { EmbraceApps } from "../../types/EmbraceApps";
import type { EmbraceApps__factory } from "../../types/factories/EmbraceApps__factory";

task("deploy:EmbraceApps").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(deployer).deploy();
  await embraceApps.deployed();
  console.log("EmbraceApps deployed to: ", embraceApps.address);

  // CREATE APPS
  const apps = [
    {
      name: "Social", // Default name on UI
      contractAddress: "0x00cBe84374Fb7E69fdd59A9a2F4f2c9Ba027b1a5", // Contract not deployed yet or required for this app
      enabled: true,
    },
    {
      name: "Creations",
      contractAddress: "0xa451f6Eb85cd486077174B8B11a7c2F5dB8970AB",
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
});
