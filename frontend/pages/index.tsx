import { PlusIcon as PlusIconMini } from "@heroicons/react/20/solid";
import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@web3modal/react";
import Link from "next/link";
import { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json";
import useEmbraceContracts from "../hooks/useEmbraceContracts";

export default function HomePage() {
  const {
    data: readData,
    error: readError,
    isLoading: readIsLoading,
  } = useContractRead({
    address: process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
    abi: EmbraceAccountsJSON.abi,
    functionName: "getAddress",
    args: ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"],
  });

  console.log("useContractRead", readData, readError?.message, readIsLoading);

  // const { data, error, isLoading } = useContractWrite({
  //   address: process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
  //   abi: EmbraceAccountsJSON.abi,
  //   functionName: "addAccount",
  //   args: ["buidler"],
  // });

  // console.log("useContractWrite", data, error, isLoading);

  return (
    <>
      <AppLayout title="Home">
        <Link href="/space/create">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 p-3 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIconMini className="h-5 w-5" aria-hidden="true" /> Create Space
          </button>
        </Link>
        <hr />
        List users spaces / List all spaces
      </AppLayout>
    </>
  );
}
