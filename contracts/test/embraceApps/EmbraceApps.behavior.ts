import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeEmbraceApps(): void {
  let signers: SignerWithAddress[], admin: SignerWithAddress;
  const appNames = ["DISC", "PGS", "GLRY", "CHAT"];

  beforeEach(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
  });

  it("should set owner correctly", async function () {
    expect(await this.embraceApps.connect(this.signers.admin).owner()).to.equal(admin.address);
  });

  it("should create apps", async function () {
    for (const [i, appName] of Object.entries(appNames)) {
      const bytes32Name = ethers.utils.formatBytes32String(appName);

      expect(await this.embraceApps.connect(this.signers.admin).createApp(bytes32Name, this.embraceApps.address, true));

      let app = await this.embraceApps.connect(this.signers.admin).getAppByIndex(i);
      expect(app.code).to.equal(bytes32Name);

      app = await this.embraceApps.connect(this.signers.admin).getAppByCode(bytes32Name);
      expect(app.code).to.equal(bytes32Name);
    }

    const apps = await this.embraceApps.connect(this.signers.admin).getApps();

    expect(apps.length).to.equal(4);
  });
}
