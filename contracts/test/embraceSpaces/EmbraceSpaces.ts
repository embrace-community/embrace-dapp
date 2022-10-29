import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeEmbraceSpaces } from "./EmbraceSpaces.behavior";
import { deployEmbraceSpacesFixture } from "./EmbraceSpaces.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    console.log('signers', signers)
    this.signers.admin = signers[0];
    this.signers.other = signers[1];

    this.loadFixture = loadFixture;
  });

  describe("EmbraceSpaces", function () {
    beforeEach(async function () {
      const { embraceSpaces } = await this.loadFixture(deployEmbraceSpacesFixture);
      this.embraceSpaces = embraceSpaces;
    });

    shouldBehaveLikeEmbraceSpaces();
  });
});
