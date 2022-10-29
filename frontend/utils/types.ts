export enum Visibility {
  PUBLIC,
  PRIVATE,
  ANONYMOUS,
}

export type EmbraceSpace = {
  handle: string;
  visibility: Visibility;
  apps: number[];
  metadata: string;
  founder: string;
  passcode: string;
};
