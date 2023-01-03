import { useContract, useProvider } from "wagmi";
import LensHubJsonAbi from "../../data/abis/lens/lens-hub-contract-abi.json";
import LensperipheryJsonAbi from "../../data/abis/lens/lens-periphery-data-provider.json";
import {
  lensHubContractAddress,
  lensPeripheryContractAddress,
} from "../../lib/envs";
import useSigner from "../useSigner";

function useLensContracts() {
  const { signer } = useSigner();
  const provider = useProvider();

  const lensHubContract = useContract({
    address: lensHubContractAddress,
    abi: LensHubJsonAbi,
    signerOrProvider: signer || provider,
  });

  const lensPeripheryContract = useContract({
    address: lensPeripheryContractAddress,
    abi: LensperipheryJsonAbi,
    signerOrProvider: signer || provider,
  });

  return { lensHubContract, lensPeripheryContract };
}

export default useLensContracts;
