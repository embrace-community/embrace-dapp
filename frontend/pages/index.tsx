import { BigNumber, Contract, Signer } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useContractRead, useSigner } from "wagmi";
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
  const spacesStore = useSelector((state: RootState) => state.spaces);
  const dispatch = useDispatch();

  const [allSpaces, setAllSpaces] = useState<InternalSpace[]>([]);
  const [allSpacesLoaded, setAllSpacesLoaded] = useState<boolean>(false);

  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const [accountsContract, setAccountsContract] = useState<Contract>();

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
    }
  }, [spacesStore.loaded, contractSpaces]);

  // Once the signer is loaded, initialize the accounts contract
  useEffect(() => {
    if (!isSignerLoading && signer) {
      const accountsContract = new Contract(
        process.env.NEXT_PUBLIC_ACCOUNTS_CONTRACT_ADDRESS!,
        EmbraceAccounts.abi,
        signer as Signer
      );

      setAccountsContract(accountsContract);
    }
  }, [signer, isSignerLoading]);

  // Once accounts contract initialized, set the user's spaces
  useEffect((): void => {
    if (!accountsContract || isSignerLoading || !signer) return;

    async function getAccountSpaces(_accountsContract): Promise<void> {
      try {
        const address = await signer?.getAddress();

        // Gets spaces for the current account in account contract
        const response = await _accountsContract.getSpaces(address);

        if (response.length > 0) {
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

    getAccountSpaces(accountsContract);
  }, [accountsContract, signer, isSignerLoading]);

  // TODO:ERROR - THIS IS BEING CALLED EVEN WHEN AN ACCOUNT IS CONNECTED
  // THIS CAUSES THE 'YOUR SPACES' TO FLASH ON THE PAGE AND THE IMAGES ARE OFTEN LOST
  // HOWEVER THIS CODE IS NEEDED OTHERWISE THE SPACES WILL NEVER SHOW WHEN AN ACCOUNT IS NOT CONNECTED
  // If no account is connected, then this will stop loading to display the community spaces
  useEffect(() => {
    if (!isSignerLoading && !signer && allSpacesLoaded) {
      // dispatch(setCommunitySpaces(allSpaces));
      // dispatch(setLoaded(true));
    }
  }, [signer, isSignerLoading, allSpacesLoaded]);

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
