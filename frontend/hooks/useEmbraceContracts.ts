import { useContract, useProvider, useSigner } from "wagmi";
import EmbraceSpacesJSON from "../data/contractArtifacts/EmbraceSpaces.json";
import EmbraceAppsJSON from "../data/contractArtifacts/EmbraceApps.json";
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json";

/*
  // After calling in the contract you can use the contract like this  
  const { data } = useQuery('prices', async () => {
    // can call any method on the contract
    // Get accounts / members etc

    // Can also write to the contract?
    
    return result;
  })
*/

function useEmbraceContracts() {
  const { data: signer } = useSigner();
  const provider = useProvider();

  const appsContract = useContract({
    address: process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!,
    abi: EmbraceAppsJSON.abi,
    signerOrProvider: signer || provider,
  });

  const spacesContract = useContract({
    address: process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    abi: EmbraceSpacesJSON.abi,
    signerOrProvider: signer || provider,
  });

  const accountsContract = useContract({
    address: process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
    abi: EmbraceAccountsJSON.abi,
    signerOrProvider: signer || provider,
  });

  return { appsContract, spacesContract, accountsContract };
}

export default useEmbraceContracts;
