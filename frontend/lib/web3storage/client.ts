import { Web3Storage } from "web3.storage"

export default function getWeb3StorageClient() {
  // @ts-ignore
  const web3StorageClient = new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY!,
  })

  return web3StorageClient
}
