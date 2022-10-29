import { useContract, useSigner } from "@web3modal/react"
import EmbraceSpacesJSON from "../data/contractArtifacts/EmbraceSpaces.json"
import EmbraceAppsJSON from "../data/contractArtifacts/EmbraceApps.json"
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json"

function useEmbraceContracts() {
  const { data: signer } = useSigner()

  console.log("EmbraceAccountsJSON", EmbraceAccountsJSON)

  //   const appsContract = useContract({
  //     address: process.env.NEXT_PUBLIC_APPS_CONTRACT_ADDRESS!,
  //     abi: EmbraceAppsJSON.abi,
  //     signerOrProvider: signer,
  //   })

  const spacesContract = useContract({
    address: process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    abi: EmbraceSpacesJSON.abi,
    signerOrProvider: signer,
  })

  //   const accountsContract = useContract({
  //     address: process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
  //     abi: EmbraceAccountsJSON.abi,
  //     signerOrProvider: signer,
  //   })

  return { spacesContract }
  //   return { appsContract, spacesContract, accountsContract }
}

export default useEmbraceContracts
