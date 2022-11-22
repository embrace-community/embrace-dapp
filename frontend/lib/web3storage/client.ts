import { Web3Storage } from "web3.storage";
import { web3StorageKey } from "../../utils/envs";

export default function getWeb3StorageClient() {
  const web3StorageClient = new Web3Storage({
    token: web3StorageKey,
  });

  return web3StorageClient;
}
