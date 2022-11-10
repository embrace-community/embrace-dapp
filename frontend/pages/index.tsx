import { useContractRead, useSigner } from "wagmi";
import { BigNumber, Contract, Signer } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import Spinner from "../components/Spinner";
import EmbraceSpaces from "../data/contractArtifacts/EmbraceSpaces.json";
import EmbraceAccounts from "../data/contractArtifacts/EmbraceAccounts.json";
import { EmbraceSpace, Visibility } from "../utils/types";

export default function HomePage() {
  const { data: signer, isLoading: isSignerLoading } = useSigner();

  const [spaceIdsUserIsMember, setSpaceIdsUserIsMember] = useState<number[]>(
    []
  );
  const [accountSpaces, setAccountSpaces] = useState<number[]>([]);
  const [accountsContract, setAccountsContract] = useState<Contract>();
  const [yourSpacesLoading, setYourSpacesLoading] = useState<boolean>(true);

  // Wagmi hook to load all community spaces
  const {
    data: spaces,
    error: _spacesError,
    isLoading: isSpacesLoading,
  } = useContractRead({
    address: process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    abi: EmbraceSpaces.abi,
    functionName: "getSpaces",
    args: [],
  });

  // If no account is connected, then this will stop loading to display the public spaces
  useEffect(() => {
    if (!isSignerLoading && !signer) {
      setYourSpacesLoading(false);
    }
  }, [signer, isSignerLoading]);

  // Once the signer is loaded, initialize the accounts contract
  useEffect(() => {
    if (!isSignerLoading) {
      const accountsContract = new Contract(
        process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
        EmbraceAccounts.abi,
        signer as Signer
      );

      setAccountsContract(accountsContract);
    }
  }, [signer, isSignerLoading]);

  // Once accounts contract initialized, set the your spaces array if signer is connected
  useEffect((): void => {
    if (!accountsContract || isSignerLoading || !signer) return;

    async function getAccountSpaces(MyContract): Promise<void> {
      try {
        const address = await signer?.getAddress();

        // Gets spaces for the current account in account contract
        const response = await MyContract.getSpaces(address);
        if (response.length > 0) {
          const spaceIds = response.map((spaceId) =>
            BigNumber.from(spaceId).toNumber()
          );

          setAccountSpaces(spaceIds);
        }
      } catch (err) {
        console.log("getAccountSpaces", err);
      } finally {
        setYourSpacesLoading(false);
      }
    }

    getAccountSpaces(accountsContract);
  }, [accountsContract, signer, isSignerLoading]);

  // Only run if there is a signer and the account spaces are loaded
  useEffect(() => {
    const getYourSpaces = async () => {
      if (!spaces) return [];

      if (signer) {
        const spaceIdsIsMember: number[] = [];

        for (let i in spaces) {
          const space = spaces[i] as EmbraceSpace;
          const spaceIndex = BigNumber.from(space.index).toNumber();

          if (accountSpaces.includes(spaceIndex)) {
            spaceIdsIsMember.push(spaceIndex);
          }

          setSpaceIdsUserIsMember(spaceIdsIsMember);
          setYourSpacesLoading(false);
        }
      }
    };

    getYourSpaces();
  }, [spaces, signer, accountSpaces]);

  const yourSpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;
      let spaceId: number = spaces[i].index.toNumber();

      return spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spaces, spaceIdsUserIsMember]);

  const allSpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;
      let spaceId: number = spaces[i].index.toNumber();

      return !spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spaces, spaceIdsUserIsMember]);

  console.log("INDEX");

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div className="extrastyles-specialpadding">
          {signer && (
            <Link href="/create">
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
                font-semibold
                text-xl
                mt-5"
              >
                + new space
              </button>
            </Link>
          )}

          {(isSpacesLoading || yourSpacesLoading) && <Spinner />}

          {!isSpacesLoading && !yourSpacesLoading && (
            <>
              {signer && (
                <SpaceCollection title="your spaces" collection={yourSpaces} />
              )}

              <SpaceCollection title="public spaces" collection={allSpaces} />
            </>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
