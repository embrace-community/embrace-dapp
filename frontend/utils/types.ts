import { BigNumber } from "ethers";

export enum Visibility {
  PUBLIC,
  PRIVATE,
  ANONYMOUS,
}

export type EmbraceSpace = {
  index: BigNumber;
  handle: string;
  visibility: Visibility;
  apps: number[];
  metadata: string;
  founder: string;
};
