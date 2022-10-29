import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { EmbraceAccounts } from "../../types/EmbraceAccounts";
import type { EmbraceAccounts__factory } from "../../types/factories/EmbraceAccounts__factory";

export async function deployEmbraceAccountsFixture(): Promise<{ embraceAccounts: EmbraceAccounts }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const embraceAccountsFactory: EmbraceAccounts__factory = <EmbraceAccounts__factory>(
    await ethers.getContractFactory("EmbraceAccounts")
  );
  const embraceAccounts: EmbraceAccounts = <EmbraceAccounts>await embraceAccountsFactory.connect(admin).deploy();
  await embraceAccounts.deployed();

  return { embraceAccounts };
}
