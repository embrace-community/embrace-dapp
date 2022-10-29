import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeEmbraceApps } from "./EmbraceApps.behavior";
import { deployEmbraceAppsFixture } from "./EmbraceApps.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];

    this.loadFixture = loadFixture;
  });

  describe("EmbraceApps", function () {
    beforeEach(async function () {
      const { embraceApps } = await this.loadFixture(deployEmbraceAppsFixture);
      this.embraceApps = embraceApps;
    });

    shouldBehaveLikeEmbraceApps();
  });
});
