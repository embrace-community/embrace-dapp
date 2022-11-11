import { BigNumber } from "ethers";

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

type MembershipGate = {
  gateType: MembershipGateType;
  tokenAddress: string;
};

type Membership = {
  kind: MembershipType;
  gate: MembershipGate;
  allowRequests: boolean;
};

export type EmbraceSpace = {
  index: BigNumber;
  handle: string;
  visibility: Visibility;
  apps: number[];
  // metadata: SpaceMetaData;
  metadata: string;
  founder: string;
  memberCount: number;
  membership: Membership;
};

export type SpaceMetaData = {
  name: string;
  description: string;
  image: string;
};

export enum EmbraceApps {
  DISCUSSIONS = 0,
  PROPOSALS = 1,
  CHAT = 2,
}
