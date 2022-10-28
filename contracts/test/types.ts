import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { EmbraceApps } from "../types/EmbraceApps";
import type { Greeter } from "../types/Greeter";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    greeter: Greeter;
    embraceApps: EmbraceApps;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
