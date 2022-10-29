import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeEmbraceAccounts } from "./EmbraceAccounts.behavior";
import { deployEmbraceAccountsFixture } from "./EmbraceAccounts.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();

    this.signers.admin = signers[0];
    this.signers.other = signers[1];

    this.loadFixture = loadFixture;
  });

  describe("EmbraceAccounts", function () {
    beforeEach(async function () {
      const { embraceAccounts } = await this.loadFixture(deployEmbraceAccountsFixture);
      this.embraceAccounts = embraceAccounts;
    });

    shouldBehaveLikeEmbraceAccounts();
  });
});
