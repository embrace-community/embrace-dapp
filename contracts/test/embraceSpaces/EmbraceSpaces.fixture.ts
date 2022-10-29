import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { EmbraceSpaces } from "../../types/EmbraceSpaces";
import type { EmbraceSpaces__factory } from "../../types/factories/EmbraceSpaces__factory";

export async function deployEmbraceSpacesFixture(): Promise<{ embraceSpaces: EmbraceSpaces }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const embraceSpacesFactory: EmbraceSpaces__factory = <EmbraceSpaces__factory>(
    await ethers.getContractFactory("EmbraceSpaces")
  );
  const embraceSpaces: EmbraceSpaces = <EmbraceSpaces>await embraceSpacesFactory.connect(admin).deploy();
  await embraceSpaces.deployed();

  return { embraceSpaces };
}
