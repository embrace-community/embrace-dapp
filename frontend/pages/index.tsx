import { useContractRead, useSigner } from "wagmi";
import { BigNumber, Contract, ethers } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import Spinner from "../components/Spinner";
import EmbraceSpaces from "../data/contractArtifacts/EmbraceSpaces.json";
import EmbraceAccounts from "../data/contractArtifacts/EmbraceAccounts.json";

import { EmbraceSpace, Visibility } from "../utils/types";

export default function HomePage() {
  const { data: signer, isError, isLoading } = useSigner();

  const [spaceIdsUserIsMember, setSpaceIdsUserIsMember] = useState<number[]>(
    []
  );
  const [accountSpaces, setAccountSpaces] = useState<number[]>([]);
  const [accountsContract, setAccountsContract] = useState<Contract>();

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

  useEffect(() => {
    if (signer) {
      const accountsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
        EmbraceAccounts.abi,
        signer
      );

      setAccountsContract(accountsContract);
    }
  }, [signer]);

  useEffect((): void => {
    if (!accountsContract) return;

    async function getAccountSpaces(MyContract): Promise<void> {
      try {
        const address = await signer?.getAddress();

        const response = await MyContract.getSpaces(address);
        if (response.length > 0) {
          const spaceIds = response.map((spaceId) =>
            BigNumber.from(spaceId).toNumber()
          );
          console.log(address, spaceIds);
          setAccountSpaces(spaceIds);
        }

        setAccountSpaces(response);
      } catch (err) {
        console.log(err);
      }
    }

    getAccountSpaces(accountsContract);
  }, [accountsContract, signer]);

  useEffect(() => {
    const getSpaceMembers = async () => {
      if (!spaces) return [];

      console.log(spaces, "SPACES!!!");

      if (signer) {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
          EmbraceSpaces.abi,
          signer
        );

        const spaceIdsIsMember: number[] = [];

        for (let i in spaces) {
          const space = spaces[i] as EmbraceSpace;
          const spaceIndex = BigNumber.from(space.index).toNumber();

          if (accountSpaces.includes(spaceIndex)) {
            spaceIdsIsMember.push(spaceIndex);
          }

          console.log(accountSpaces, "accountSpaces", spaceIdsIsMember);

          setSpaceIdsUserIsMember(spaceIdsIsMember);
        }
      }
    };

    getSpaceMembers();
  }, [spaces, signer, accountSpaces]);

  const mySpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;
      let spaceId: number = spaces[i].index.toNumber();

      console.log(spaceId, "spaceId", spaceIdsUserIsMember);

      return spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spaces, spaceIdsUserIsMember]);

  const allSpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;
      let spaceId: number = Number(i) + 1;

      return !spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spaces, spaceIdsUserIsMember]);

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div className="extrastyles-specialpadding">
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
                font-semibold
                text-xl
                mt-5"
            >
              + new space
            </button>
          </Link>

          {isSpacesLoading && <Spinner />}

          {!isSpacesLoading && (
            <>
              <SpaceCollection title="your spaces" collection={mySpaces} />

              <SpaceCollection title="public spaces" collection={allSpaces} />
            </>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
