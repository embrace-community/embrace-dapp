import { useContract, useProvider, useSigner } from "wagmi";
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json";
import EmbraceAppsJSON from "../data/contractArtifacts/EmbraceApps.json";
import EmbraceSpacesJSON from "../data/contractArtifacts/EmbraceSpaces.json";
import {
  accountsContractAddress,
  appContractAddress,
  spacesContractAddress
} from "../utils/envs";

function useEmbraceContracts() {
  const { data: signer } = useSigner();
  const provider = useProvider();

  const appsContract = useContract({
    address: appContractAddress,
    abi: EmbraceAppsJSON.abi,
    signerOrProvider: signer || provider,
  });

  const spacesContract = useContract({
    address: spacesContractAddress,
    abi: EmbraceSpacesJSON.abi,
    signerOrProvider: signer || provider,
  });

  const accountsContract = useContract({
    address: accountsContractAddress,
    abi: EmbraceAccountsJSON.abi,
    signerOrProvider: signer || provider,
  });

  return { appsContract, spacesContract, accountsContract };
}

export default useEmbraceContracts;
