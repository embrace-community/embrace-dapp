import { BigNumber } from "ethers";

export enum Visibility {
  PUBLIC,
  PRIVATE,
  ANONYMOUS,
}

export enum MembershipType {
  PUBLIC,
  TOKEN_GATED,
}

export type EmbraceSpace = {
  index: BigNumber;
  handle: string;
  visibility: Visibility;
  apps: number[];
  // metadata: SpaceMetaData;
  metadata: string;
  founder: string;
  memberCount: number;
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
