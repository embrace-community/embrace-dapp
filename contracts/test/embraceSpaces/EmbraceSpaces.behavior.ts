import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export function shouldBehaveLikeEmbraceSpaces(): void {
  let signers: SignerWithAddress[], admin: SignerWithAddress;
  const handle = ethers.utils.formatBytes32String("My space");
  const visibility = 0;
  const apps: number[] = [1, 4, 5];
  const metadata = "https://gateway.ipfs.io/ipfs/Qmd8HLnL2eAAL2zZLDaM7tWgUdZwfMY2VrGRA6693C3mNE";

  beforeEach(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
  });

  it("should create a space and return them correctly", async function () {
    await this.embraceSpaces.connect(this.signers.admin).createSpace(handle, visibility, apps, metadata);

    const spaces = await this.embraceSpaces.connect(this.signers.admin).getSpaces();

    expect(spaces.length).to.equal(1);

    const space = await this.embraceSpaces.connect(this.signers.admin).getSpace(0);
    expect(space.handle).to.equal(handle);
    expect(space.visibility).to.equal(0);
    expect(space.apps.length).to.equal(3);
    expect(space.apps).to.deep.equal([BigNumber.from("1"), BigNumber.from("4"), BigNumber.from("5")]);
    expect(space.metadata).to.equal(metadata);
  });

  it.only("should create a space and set meta correctly", async function () {
    await this.embraceSpaces.connect(this.signers.admin).createSpace(handle, visibility, apps, metadata);

    expect(await this.embraceSpaces.connect(this.signers.admin).isAdmin(0)).to.equal(true);
    expect(await this.embraceSpaces.connect(this.signers.other).isAdmin(0)).to.equal(false);

    expect(await this.embraceSpaces.connect(this.signers.admin).isFounder(0)).to.equal(true);
    expect(await this.embraceSpaces.connect(this.signers.other).isFounder(0)).to.equal(false);
  });
}
