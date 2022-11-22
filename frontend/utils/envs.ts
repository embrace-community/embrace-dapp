// contracts

const appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!;
const spacesContractAddress = process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!;
const accountsContractAddress =
  process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!;

if (!appContractAddress && process.env.NODE_ENV !== "test")
  throw Error("App Contract Address Env missing");
if (!spacesContractAddress && process.env.NODE_ENV !== "test")
  throw Error("Spaces Contract Address Env missing");
if (!accountsContractAddress && process.env.NODE_ENV !== "test")
  throw Error("Accounts Contract Address Env missing");

// ipfs + blockchain connection

const web3StorageKey = process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY!;
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY!;

if (!web3StorageKey && process.env.NODE_ENV !== "test")
  throw Error("Web3 Storage Key Env missing");
if (!infuraApiKey && process.env.NODE_ENV !== "test")
  throw Error("Infura Api Key Env missing");
const blockchainExplorerUrl = process.env.NEXT_PUBLIC_BLOCKEXPLORER_URL;
if (!blockchainExplorerUrl && process.env.NODE_ENV !== "test")
  throw Error("Blockchain Explorer Key Env missing");

export {
  appContractAddress,
  spacesContractAddress,
  accountsContractAddress,
  web3StorageKey,
  infuraApiKey,
  blockchainExplorerUrl,
};
