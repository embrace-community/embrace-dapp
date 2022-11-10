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
  metadata: string;
  founder: string;
};
