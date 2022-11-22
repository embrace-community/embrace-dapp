import { BigNumber, Contract, Signer } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useAccount, useContractRead, useSigner } from "wagmi";
import AppLayout from "../components/AppLayout";
import SpaceCollection from "../components/SpaceCollection";
import Spinner from "../components/Spinner";
import EmbraceAccounts from "../data/contractArtifacts/EmbraceAccounts.json";
import EmbraceSpacesJson from "../data/contractArtifacts/EmbraceSpaces.json";
import { EmbraceSpaces } from "../data/contractTypes";
import { InternalSpace, InternalSpaces } from "../entities/space";
import { RootState } from "../store/store";
import {
  setLoaded,
  setCommunitySpaces,
  setYourSpaces,
} from "../store/slices/space";

export default function HomePage() {
  const spacesStore = useAppSelector((state: RootState) => state.spaces);
  const dispatch = useAppDispatch();

  const [allSpaces, setAllSpaces] = useState<InternalSpace[]>([]);
  const [allSpacesLoaded, setAllSpacesLoaded] = useState<boolean>(false);

  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const { address: accountAddress } = useAccount();

  // Wagmi hook to load all community spaces
  const {
    data: contractSpaces,
    error: _spacesError,
    isLoading: isSpacesLoading,
  } = useContractRead({
    address: process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    abi: EmbraceSpacesJson.abi,
    functionName: "getSpaces",
    args: [],
  });

  // This will load all spaces from the contract
  useEffect(() => {
    if (!isSpacesLoading && !spacesStore.loaded && contractSpaces) {
      const internalSpaces = InternalSpaces.from_dto(
        contractSpaces as EmbraceSpaces.SpaceStructOutput[]
      );

      setAllSpaces(internalSpaces);
      setAllSpacesLoaded(true);
      console.log("LOADING SPACES", internalSpaces, contractSpaces);
    }
  }, [spacesStore.loaded, contractSpaces]);

  // Once accounts contract initialized, set the user's spaces
  useEffect((): void => {
    if (isSignerLoading || !signer) return;

    async function getAccountSpaces(): Promise<void> {
      try {
        const accountsContract = new Contract(
          process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
          EmbraceAccounts.abi,
          signer as Signer
        );

        const address = await signer?.getAddress();

        // Gets spaces for the current account in account contract
        const response = await accountsContract.getSpaces(address);

        if (response.length > 0 && allSpaces.length) {
          const spaceIds = response.map((spaceId) =>
            BigNumber.from(spaceId).toNumber()
          );

          if (spaceIds) {
            const yourSpaces = allSpaces?.filter((space) =>
              spaceIds.includes(space.id)
            );

            dispatch(setYourSpaces(yourSpaces));
          }

          const communitySpaces = allSpaces?.filter((space) => {
            return !spaceIds?.includes(space.id);
          });

          dispatch(setCommunitySpaces(communitySpaces));
          dispatch(setLoaded(true));
        }
      } catch (err) {
        console.log("getAccountSpaces", err);
      }
    }

    getAccountSpaces();
  }, [signer, isSignerLoading, allSpaces]);

  /// BUG: With useSigner, there is a time on initial load when !isSignerLoading && !signer even when there is a signer
  // To get round this we get the accountAddress to see if this is also empty
  useEffect(() => {
    if (!isSignerLoading && !signer && !accountAddress && allSpacesLoaded) {
      dispatch(setCommunitySpaces(allSpaces));
      dispatch(setLoaded(true));
    }
  }, [signer, isSignerLoading, accountAddress, allSpacesLoaded]);

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div className="extrastyles-specialpadding">
          {signer && (
            <Link href="/create">
              <button
                type="button"
                className="inline-flex items-center rounded-full border-violet-500 border-2 bg-transparent py-4 px-12 text-violet-500 shadow-sm focus:outline-none focus:ring-none mb-11 font-semibold text-xl mt-5"
              >
                + new space
              </button>
            </Link>
          )}

          {(isSpacesLoading || !spacesStore.loaded) && <Spinner />}

          {!isSpacesLoading && spacesStore.loaded && (
            <>
              {signer && spacesStore.yourSpaces.length > 0 && (
                <SpaceCollection
                  title="your spaces"
                  collection={spacesStore.yourSpaces}
                />
              )}
              {spacesStore.communitySpaces.length > 0 && (
                <SpaceCollection
                  title="community spaces"
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
