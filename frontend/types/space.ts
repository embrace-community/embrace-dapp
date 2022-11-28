import { CIDString } from "web3.storage";

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

export type MembershipGate = {
  token: MembershipGateToken;
  tokenAddress: string;
};

export type Membership = {
  access: Access;
  gate: MembershipGate;
  allowRequests: boolean;
};

export type Space = {
  id: number;
  handle: string;
  founder: string;
  visibility: Visibility;
  membership: Membership;
  apps: number[];
  metadata: CIDString;
  loadedMetadata?: SpaceMetadata;
  memberCount: number;
  image?: string;
};

export type SpaceMetadata = {
  name: string;
  description: string;
  image: string;
  handle: string;
};

export type SpaceMembership = {
  isActive: boolean;
  isAdmin: boolean;
  isRequest: boolean;
};

export type AppMetadata = {
  name: string;
  description: string;
  logo: string;
  image: string;
};
