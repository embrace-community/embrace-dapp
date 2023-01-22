export type Collection = {
  id: number;
  name: string;
  contractAddress: string;
};

export type Creation = {
  tokenId: number;
  tokenURI: string;
  owner: string;
  loadedMetadata?: any;
};
