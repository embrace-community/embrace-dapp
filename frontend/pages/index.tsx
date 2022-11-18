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
import { InternalSpace } from "../entities/space";
import { RootState } from "../state/reduxStore";
import { setLoaded, setSpaces } from "../state/spaceSlice";
import { EmbraceSpace } from "../types/space";

export default function HomePage() {
  const spacesState = useSelector((state: RootState) => state.spaces);
  const dispatch = useDispatch();

  const { data: signer, isLoading: isSignerLoading } = useSigner();

  const [spaceIdsUserIsMember, setSpaceIdsUserIsMember] = useState<number[]>(
    []
  );
  const [accountSpaces, setAccountSpaces] = useState<number[]>([]);
  const [accountsContract, setAccountsContract] = useState<Contract>();
  const [yourSpacesLoading, setYourSpacesLoading] = useState<boolean>(true);

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

  useEffect(() => {
    if (!isSpacesLoading && !spacesState.loaded && contractSpaces) {
      dispatch(
        setSpaces(
          InternalSpace.from_dto(
            contractSpaces as EmbraceSpaces.SpaceStructOutput[]
          )
        )
      );
      dispatch(setLoaded(true));
    }
  }, [spacesState.spaces, contractSpaces]);

  // If no account is connected, then this will stop loading to display the public spaces
  useEffect(() => {
    if (!isSignerLoading && !signer) {
      setYourSpacesLoading(false);
    }
  }, [signer, isSignerLoading]);

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
      if (!spacesState.spaces) return [];

      if (signer) {
        const spaceIdsIsMember: number[] = [];

        for (let i in spacesState.spaces) {
          const space = spacesState.spaces[i] as EmbraceSpace;
          const spaceId = space.id;

          if (accountSpaces.includes(spaceId)) {
            spaceIdsIsMember.push(spaceId);
          }

          setSpaceIdsUserIsMember(spaceIdsIsMember);
          setYourSpacesLoading(false);
        }
      }
    };

    getYourSpaces();
  }, [spacesState.spaces, signer, accountSpaces]);

  const yourSpaces = useMemo(() => {
    if (!spacesState.spaces) return [];

    return (spacesState.spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;

      let spaceId: number = spacesState.spaces[i].id;

      return spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spacesState.spaces, spaceIdsUserIsMember]);

  const allSpaces = useMemo(() => {
    if (!spacesState.spaces) return [];

    return (spacesState.spaces as EmbraceSpace[]).filter((_, i) => {
      if (!Array.isArray(spaceIdsUserIsMember)) return false;
      let spaceId: number = spacesState.spaces[i].id;

      return !spaceIdsUserIsMember?.includes(spaceId);
    });
  }, [spacesState.spaces, spaceIdsUserIsMember]);

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

          {(isSpacesLoading || yourSpacesLoading) && <Spinner />}

          {!isSpacesLoading && !yourSpacesLoading && (
            <>
              {signer && yourSpaces.length > 0 && (
                <SpaceCollection title="your spaces" collection={yourSpaces} />
              )}
              {allSpaces.length > 0 && (
                <SpaceCollection
                  title="community spaces"
                  collection={allSpaces}
                />
              )}
            </>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
