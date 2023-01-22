import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

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

export enum Access {
  OPEN,
  GATED,
  CLOSED,
}

export enum MembershipGateToken {
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
  token: MembershipGateToken;
  tokenAddress: string;
}
export interface Membership {
  access: Access;
  gate: MembershipGate;
  allowRequests: false;
}
