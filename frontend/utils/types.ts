import { BigNumber } from "ethers";

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

type MembershipGate = {
  token: MembershipGateToken;
  tokenAddress: string;
};

type Membership = {
  access: Access;
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

export type SpaceMembership = {
  isActive: boolean;
  isAdmin: boolean;
  isRequest: boolean;
};
