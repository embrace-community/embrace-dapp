import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { formatBytes32String } from "ethers/lib/utils";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSpace } from "../../scripts/utils";
import { EmbraceAccounts } from "../../types/contracts/EmbraceAccounts";
import { EmbraceApps } from "../../types/contracts/EmbraceApps";
import { EmbraceSpaces } from "../../types/contracts/EmbraceSpaces";
import { EmbraceAccounts__factory } from "../../types/factories/contracts/EmbraceAccounts__factory";
import { EmbraceApps__factory } from "../../types/factories/contracts/EmbraceApps__factory";
import { EmbraceSpaces__factory } from "../../types/factories/contracts/EmbraceSpaces__factory";
import { EmbraceSpace } from "./../../../frontend/utils/types";

task("deploy:EmbraceAll").setAction(async function (_taskArguments: TaskArguments, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );

  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(deployer).deploy();
  await embraceAccounts.deployed();

  console.log(`NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS="${embraceAccounts.address}"`);

  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>(
    await embraceSpacesFactory.connect(deployer).deploy(embraceAccounts.address)
  );
  await embraceSpaces.deployed();
  console.log(`NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS="${embraceSpaces.address}"`);

  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(deployer).deploy();
  await embraceApps.deployed();
  console.log(`NEXT_PUBLIC_APPS_CONTRACT_ADDRESS="${embraceApps.address}"`);

  const spaces = ["public", "public-gated", "private-gated", "private-closed", "private-closed-reqs", "anon"];
  const metadata = "bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa";
  for (let i = 0; i < spaces.length; i++) {
    const space = getSpace(spaces[i], spaces[i], metadata) as EmbraceSpace;

    if (space) {
      await embraceSpaces.createSpace(
        formatBytes32String(space.handle),
        space.visibility,
        space.membership,
        space.apps,
        space.metadata,
        {
          gasLimit: 1000000,
        },
      );

      console.log(`Created space ${space.handle}`);
    }
  }

  // code: string, contractAddress: string, metadata: string
  const apps = [
    {
      code: "Chat Server", // This should be short code i.e. CHAT
      contractAddress: "0xE300bF5B76671A5C702F9E48B8e5e91cE8C8C282", // Contract not deployed yet or required for this app
    },
    {
      code: "Discussions", // DISC
      contractAddress: "0xE300bF5B76671A5C702F9E48B8e5e91cE8C8C282", // Contract not deployed yet or required for this app
    },
    {
      code: "Social", // SOCIAL
      contractAddress: "0xE300bF5B76671A5C702F9E48B8e5e91cE8C8C282", // Contract not deployed yet or required for this app
    },
  ];
  // Currently this is not a real app CID, but it is a valid CID
  const appMetadata = "bafkreiafq3fhpjp2yyfo2qcb2mrabrj4kqbm2axbzowsf6qh5oczvwwfwa";
  for (let j = 0; j < apps.length; j++) {
    const app = apps[j];

    if (app) {
      const enabled = true;

      await embraceApps.createApp(app.code, app.contractAddress, appMetadata, enabled, {
        gasLimit: 1000000,
      });

      console.log(`Created app ${app.code}`);
    }
  }
});
