import { useContractRead, useSigner } from "wagmi";
import { ethers } from "ethers";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import Spinner from "../components/Spinner";
import EmbraceSpaces from "../data/contractArtifacts/EmbraceSpaces.json";
import { EmbraceSpace, Visibility } from "../utils/types";

export default function HomePage() {
  const { data: signer, isError, isLoading } = useSigner();

  const [spaceIdsUserIsMember, setSpaceIdsUserIsMember] = useState<number[]>(
    []
  );

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
  console.dir(spaces)

  useEffect(() => {
    const getSpaceMembers = async () => {
      if (!spaces) return [];

      if (signer) {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
          EmbraceSpaces.abi,
          signer
        );

        const spaceIdsIsMember: number[] = [];
        const userAddress = await signer.getAddress();

        for (const i of Object.keys(spaces as EmbraceSpace[])) {
          const isMember: boolean = await contract.spaceMembers(i, userAddress);

          if (isMember) spaceIdsIsMember.push(+i);
        }

        setSpaceIdsUserIsMember(spaceIdsIsMember);
      }
    };

    getSpaceMembers();
  }, [spaces, signer]);

  const mySpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;

      return spaceIdsUserIsMember?.includes(+i);
    });
  }, [spaces, spaceIdsUserIsMember]);

  const allSpaces = useMemo(() => {
    if (!spaces) return [];

    return (spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;

      return !spaceIdsUserIsMember?.includes(+i);
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
                font-semibold"
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
