const isNoTestEnvironment = process.env.NODE_ENV !== "test";

// contracts

const appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!;
const spacesContractAddress = process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!;
const accountsContractAddress =
  process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!;
const deployedChainIdEnv = process.env.NEXT_PUBLIC_DEPLOYED_CHAIN_ID!;

if (!appContractAddress && isNoTestEnvironment)
  throw Error("App Contract Address Env missing");
if (!spacesContractAddress && isNoTestEnvironment)
  throw Error("Spaces Contract Address Env missing");
if (!accountsContractAddress && isNoTestEnvironment)
  throw Error("Accounts Contract Address Env missing");

if (
  (!deployedChainIdEnv || !Number.isInteger(+deployedChainIdEnv)) &&
  isNoTestEnvironment
)
  throw Error("Deployed Chain Id Env missing");
const deployedChainId = Number(deployedChainIdEnv);

// ipfs + blockchain connection

const web3StorageKey = process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY!;
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY!;
const blockchainExplorerUrl = process.env.NEXT_PUBLIC_BLOCKEXPLORER_URL!;

if (!web3StorageKey && isNoTestEnvironment)
  throw Error("Web3 Storage Key Env missing");
if (!infuraApiKey && isNoTestEnvironment)
  throw Error("Infura Api Key Env missing");
if (!blockchainExplorerUrl && isNoTestEnvironment)
  throw Error("Blockchain Explorer Key Env missing");

export {
  appContractAddress,
  spacesContractAddress,
  accountsContractAddress,
  deployedChainId,
  web3StorageKey,
  infuraApiKey,
  blockchainExplorerUrl,
};
