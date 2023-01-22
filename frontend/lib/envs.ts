const isNoTestEnvironment = process.env.NODE_ENV !== "test";

// contracts
const deployedChainIdEnv = process.env.NEXT_PUBLIC_DEPLOYED_CHAIN_ID!;

let appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!;
let spacesContractAddress = process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!;
let accountsContractAddress =
  process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!;
let appCreationsContractAddress =
  process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS!;
let appSocialsContractAddress =
  process.env.NEXT_PUBLIC_SOCIALS_CONTRACT_ADDRESS!;

if (deployedChainIdEnv === "1337") {
  appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS_LOCAL!;
  spacesContractAddress =
    process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS_LOCAL!;
  accountsContractAddress =
    process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS_LOCAL!;
  appCreationsContractAddress =
    process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS_LOCAL!;
  appSocialsContractAddress =
    process.env.NEXT_PUBLIC_SOCIALS_CONTRACT_ADDRESS_LOCAL!;
} else if (deployedChainIdEnv === "5") {
  appContractAddress = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS_GOERLI!;
  spacesContractAddress =
    process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS_GOERLI!;
  accountsContractAddress =
    process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS_GOERLI!;
  appCreationsContractAddress =
    process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS_GOERLI!;
  appSocialsContractAddress =
    process.env.NEXT_PUBLIC_SOCIALS_CONTRACT_ADDRESS_GOERLI!;
}

if (isNoTestEnvironment) {
  if (!appContractAddress)
    throw Error("App Contract Address Env missing, appContractAddress");
  if (!spacesContractAddress)
    throw Error("Spaces Contract Address Env missing, spacesContractAddress");
  if (!accountsContractAddress)
    throw Error(
      "Accounts Contract Address Env missing, accountsContractAddress",
    );
  if (!appCreationsContractAddress)
    throw Error(
      "Creations App Contract Address Env missing, appCreationsContractAddress",
    );
  if (!appSocialsContractAddress)
    throw Error(
      "Social App Contract Address Env missing, appSocialsContractAddress",
    );
}

const lensHubContractAddress = process.env.NEXT_PUBLIC_LENS_HUB_CONTRACT!;
const lensPeripheryContractAddress =
  process.env.NEXT_PUBLIC_LENS_PERIPHERY_CONTRACT!;

if (!lensHubContractAddress && isNoTestEnvironment)
  throw Error("lens Hub Contract Address Env missing");
if (!lensPeripheryContractAddress && isNoTestEnvironment)
  throw Error("lens Periphery Contract Address Env missing");

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

// Video related API Keys
const livepeerApiKey = process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY!;
const huddleApiKey = process.env.NEXT_PUBLIC_HUDDLE_API_KEY!;

if (!livepeerApiKey && isNoTestEnvironment)
  throw Error("Livepeer API Key Env missing");

if (!huddleApiKey && isNoTestEnvironment)
  throw Error("Huddle API Key Env missing");

// Ceramic
const ceramicUri = process.env.NEXT_PUBLIC_CERAMIC_URI!;
if (!ceramicUri && isNoTestEnvironment) throw Error("Ceramic Uri Env missing");

export {
  appContractAddress,
  spacesContractAddress,
  accountsContractAddress,
  appCreationsContractAddress,
  appSocialsContractAddress,
  deployedChainId,
  web3StorageKey,
  infuraApiKey,
  blockchainExplorerUrl,
  lensHubContractAddress,
  lensPeripheryContractAddress,
  livepeerApiKey,
  huddleApiKey,
  ceramicUri,
};
