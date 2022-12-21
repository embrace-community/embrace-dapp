const isNoTestEnvironment = process.env.NODE_ENV !== "test";

// contracts
const deployedChainIdEnv = process.env.NEXT_PUBLIC_DEPLOYED_CHAIN_ID!;

let appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!;
let spacesContractAddress = process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!;
let accountsContractAddress =
  process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!;
let appCreationsContractAddress =
  process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS!;

if (deployedChainIdEnv === "1337") {
  appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS_LOCAL!;
  spacesContractAddress =
    process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS_LOCAL!;
  accountsContractAddress =
    process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS_LOCAL!;
  appCreationsContractAddress =
    process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS_LOCAL!;
}

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
  appCreationsContractAddress,
  deployedChainId,
  web3StorageKey,
  infuraApiKey,
  blockchainExplorerUrl,
};
