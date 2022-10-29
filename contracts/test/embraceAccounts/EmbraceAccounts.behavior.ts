import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export function shouldBehaveLikeEmbraceAccounts(): void {
  let signers: SignerWithAddress[], admin: SignerWithAddress;
  const handle = ethers.utils.formatBytes32String("My space");

  beforeEach(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
  });

  it("should add an account", async function () {
    await this.embraceAccounts.connect(this.signers.admin).addAccount(handle);

    const returnedHandle = await this.embraceAccounts.connect(this.signers.admin).getHandle(this.signers.admin.address);

    expect(returnedHandle).to.equal(handle);

    const returnedAddress = await this.embraceAccounts.connect(this.signers.admin).getAddress(handle);
    expect(returnedAddress).to.equal(this.signers.admin.address);
  });
}
