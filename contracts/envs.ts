const web3StorageKey = process.env.WEB3_STORAGE_KEY!;
const accountsContract = process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!;
const spacesContract = process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!;
const appsContract = process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!;
const creationsContract = process.env.NEXT_PUBLIC_CREATIONS_CONTRACT_ADDRESS!;

if (!web3StorageKey) throw Error("Web3 Storage Key Env missing");

export { web3StorageKey, accountsContract, spacesContract, creationsContract, appsContract };
