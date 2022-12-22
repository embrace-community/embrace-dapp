import { useContract, useProvider, useSigner } from "wagmi";
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json";
import EmbraceAppsJSON from "../data/contractArtifacts/EmbraceApps.json";
import EmbraceSpacesJSON from "../data/contractArtifacts/EmbraceSpaces.json";
import AppCreationsJSON from "../data/contractArtifacts/AppCreations.json";
import AppCreationsCollectionJSON from "../data/contractArtifacts/AppCreationsCollection.json";

import {
  accountsContractAddress,
  appContractAddress,
  spacesContractAddress,
  appCreationsContractAddress,
} from "../lib/envs";

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

  return {
    appsContract,
    spacesContract,
    accountsContract,
  };
}

export function useAppContract() {
  const { signer } = useSigner();
  const provider = useProvider();

  const appCreationsContract = useContract({
    address: appCreationsContractAddress,
    abi: AppCreationsJSON.abi,
    signerOrProvider: signer || provider,
  });

  return {
    appCreationsContract,
    // We export this instead of the contract as the collection address is dynamic
    appCreationCollectionsABI: AppCreationsCollectionJSON.abi,
  };
}

export default useEmbraceContracts;
