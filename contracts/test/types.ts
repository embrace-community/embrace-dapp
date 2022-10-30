import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { EmbraceApps } from "../types/EmbraceApps";

type Fixture<T> = () => Promise<T>;

export interface Signers {
  admin: SignerWithAddress;
  other?: SignerWithAddress;
}

export enum Visibility {
  PUBLIC,
  PRIVATE,
  ANONYMOUS,
}
