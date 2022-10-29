import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { EmbraceApps } from "../../types/EmbraceApps";
import type { EmbraceApps__factory } from "../../types/factories/EmbraceApps__factory";

export async function deployEmbraceAppsFixture(): Promise<{ embraceApps: EmbraceApps }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const embraceAppsFactory: EmbraceApps__factory = <EmbraceApps__factory>await ethers.getContractFactory("EmbraceApps");
  const embraceApps: EmbraceApps = <EmbraceApps>await embraceAppsFactory.connect(admin).deploy();
  await embraceApps.deployed();

  return { embraceApps };
}
