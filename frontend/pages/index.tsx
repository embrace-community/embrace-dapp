import { useContractRead } from "@web3modal/react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import EmbraceAccountsJSON from "../data/contractArtifacts/EmbraceAccounts.json";
import { Visibility } from "../utils/types";

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

  const embraceSpaces = [];

  const spacecollection1 = [
    {
      handle: "1nametest",
      visibility: Visibility.PUBLIC,
      apps: [],
      metadata: "https://cdn-icons-png.flaticon.com/512/168/168726.png",
      founder: "",
      passcode: "",
    },
    {
      handle: "2nametest",
      visibility: Visibility.PUBLIC,
      apps: [],
      metadata:
        "https://img.freepik.com/free-vector/random-square-halftone-pattern_1409-1062.jpg?w=2000",
      founder: "",
      passcode: "",
    },
  ];
  const spacecollection2 = [
    {
      handle: "1nametest_col2",
      visibility: Visibility.PUBLIC,
      apps: [],
      metadata: "test",
      founder: "",
      passcode: "",
    },
    {
      handle: "2nametest_col2",
      visibility: Visibility.PUBLIC,
      apps: [],
      metadata: "test",
      founder: "",
      passcode: "",
    },
  ];

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div>
          <Link href="/space/create">
            <button
              type="button"
              className="
                inline-flex
                items-center
                rounded-full
                border-violet-500
                border-2
                bg-transparent
                py-4
                px-12
                text-violet-500
                shadow-sm
                focus:outline-none
                focus:ring-none
                mb-11
                font-semibold"
            >
              + new space
            </button>
          </Link>

          <SpaceCollection title="your spaces" collection={spacecollection1} />

          <SpaceCollection
            title="public spaces"
            collection={spacecollection2}
          />
        </div>
      </AppLayout>
    </div>
  );
}
