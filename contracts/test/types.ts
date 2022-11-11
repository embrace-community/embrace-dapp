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

export enum MembershipType {
  OPEN,
  GATED,
  CLOSED,
}

export enum MembershipGateType {
  NONE,
  ERC20,
  ERC721,
  ERC1155,
}

export enum Chains {
  MAINNET = 1,
  GOERLI = 5,
  POLYGON = 137,
  POLYGONMUMBAI = 80001,
}

export interface MembershipGate {
  chainId: number;
  gateType: MembershipGateType;
  tokenAddress: string;
}
export interface Membership {
  kind: MembershipType;
  gate: MembershipGate;
  allowRequests: false;
}
