import { BigNumber } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Address, useAccount, useContractRead } from "wagmi";
import { useSigner } from "wagmi";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import Spinner from "../components/Spinner";
import EmbraceSpacesJson from "../data/contractArtifacts/EmbraceSpaces.json";
import { EmbraceSpaces } from "../data/contractTypes";
import useEmbraceContracts from "../hooks/useEmbraceContracts";
import { spacesContractAddress } from "../lib/envs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCommunitySpaces,
  setLoaded,
  setYourSpaces,
} from "../store/slices/space";
import { RootState } from "../store/store";
import { Space } from "../types/space";
import { SpaceUtil } from "../types/space-type-utils";
import Button from "../components/Button";
import { PlusCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const spacesStore = useAppSelector((state: RootState) => state.spaces);
  const dispatch = useAppDispatch();

  const [allSpaces, setAllSpaces] = useState<Space[]>([]);

  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const { address: accountAddress } = useAccount();
  const { accountsContract } = useEmbraceContracts();

  // Wagmi hook to load all community spaces
  const { data: contractSpaces, isLoading: isSpacesLoading } = useContractRead({
    address: spacesContractAddress as Address,
    abi: EmbraceSpacesJson.abi,
    functionName: "getSpaces",
    args: [],
  });

  // This will load all spaces from the contract
  useEffect(() => {
    if (!isSpacesLoading && !spacesStore.loaded && contractSpaces) {
      const spaces = (contractSpaces as EmbraceSpaces.SpaceStructOutput[]).map(
        (contractSpace) => SpaceUtil.from_dto(contractSpace),
      );

      console.log("spaces", spaces);

      setAllSpaces(spaces);
      dispatch(setLoaded(true));
    }
  }, [spacesStore.loaded, contractSpaces, isSpacesLoading, dispatch]);

  // Once accounts contract initialized, set the user's spaces
  useEffect((): void => {
    if (isSignerLoading || !signer || !spacesStore.loaded) return;

    async function getAccountSpaces(): Promise<void> {
      if (!accountsContract) return;

      try {
        // Gets spaces for the current account in account contract
        const response = await accountsContract.getSpaces(accountAddress);

        if (response.length && allSpaces.length) {
          const spaceIds = response.map((spaceId) =>
            BigNumber.from(spaceId).toNumber(),
          );

          if (spaceIds) {
            const yourSpaces = allSpaces?.filter((space) =>
              spaceIds.includes(space.id),
            );

            dispatch(setYourSpaces(yourSpaces));
          }

          const communitySpaces = allSpaces?.filter((space) => {
            return !spaceIds?.includes(space.id);
          });

          dispatch(setCommunitySpaces(communitySpaces));
          dispatch(setLoaded(true));
        } else if (allSpaces.length) {
          dispatch(setCommunitySpaces(allSpaces));
          dispatch(setLoaded(true));
        }
      } catch (err) {
        console.log("getAccountSpaces", err);
      }
    }

    getAccountSpaces();
  }, [
    accountAddress,
    accountsContract,
    allSpaces,
    dispatch,
    isSignerLoading,
    signer,
    spacesStore.loaded,
  ]);

  /// BUG: With useSigner, there is a time on initial load when !isSignerLoading && !signer even when there is a signer
  // To get round this we get the accountAddress to see if this is also empty
  useEffect(() => {
    if (
      !isSignerLoading &&
      !signer &&
      !accountAddress &&
      spacesStore.loaded &&
      allSpaces.length
    ) {
      dispatch(setCommunitySpaces(allSpaces));
      dispatch(setLoaded(true));
    }
  }, [
    signer,
    isSignerLoading,
    accountAddress,
    dispatch,
    allSpaces,
    spacesStore.loaded,
  ]);

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div className="w-full pt-8 pr-8 pb-28 pl-[6.8vw]">
          {signer && (
            <div className="flex items-center justify-center md:justify-start">
              <Link href="/create">
                <Button additionalClassName="inline-flex items-center py-4 px-8 mb-11 font-semibold text-xl mt-5">
                  <PlusIcon width={24} className="mr-2" /> new community
                </Button>
              </Link>
            </div>
          )}

          {(isSpacesLoading || !spacesStore.loaded) && <Spinner />}

          {!isSpacesLoading && spacesStore.loaded && (
            <>
              {signer && spacesStore.yourSpaces.length > 0 && (
                <SpaceCollection
                  title="your communities"
                  collection={spacesStore.yourSpaces}
                />
              )}
              {spacesStore.communitySpaces.length > 0 && (
                <SpaceCollection
                  title="public communities"
                  collection={spacesStore.communitySpaces}
                />
              )}
            </>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
