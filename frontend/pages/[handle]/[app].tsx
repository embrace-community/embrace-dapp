import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import AppLayout from "../../components/AppLayout";
import Apps from "../../components/space/Apps";
import Header from "../../components/space/Header";
import Spinner from "../../components/Spinner";
import { EmbraceSpaces } from "../../data/contractTypes";
import useEmbraceContracts from "../../hooks/useEmbraceContracts";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../../lib/web3storage/getIpfsJsonContent";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSpaceById, moveJoinedToYourSpaces } from "../../store/slices/space";
import { Space, SpaceMembership, SpaceMetadata } from "../../types/space";
import { SpaceUtil } from "../../types/space-type-utils";

export default function SpaceViewPage() {
  // TODO: Signer not loading when directly viewing a space page
  const { spacesContract } = useEmbraceContracts();

  const [spaceData, setSpaceData] = useState<Space | null>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(false);

  const [isFounder, setIsFounder] = useState<boolean>(false);
  const [membershipInfoLoaded, setMembershipInfoLoaded] =
    useState<boolean>(false);
  const [accountMembership, setAccountMembership] = useState<SpaceMembership>();
  const [joinSpaceLoading, setJoinSpaceLoading] = useState<boolean>(false);
  const getSpaceByIdSelector = useAppSelector(getSpaceById);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const routerIsReady = router.isReady;
  const { address } = useAccount();

  // Once contract is initialized then get the space Id from the router handle and load the space data
  useEffect((): void => {
    if (!routerIsReady || spaceData || !spacesContract) return;

    // Check to see if the spaceId can be found in the store
    // This will only work when routing inside the NextJs app
    // I.e. from the homepage, or from create page
    if (router.query.spaceId) {
      const spaceId = Number(router.query.spaceId as string);
      const space = getSpaceByIdSelector(spaceId);

      // If it can then set the space data and prevent looking up the space data from the contract
      if (space) {
        setSpaceData(space);
        setIsFounder(space.founder === address);
        console.log(
          `space found in store. Founder=${space.founder} connectedAddress=${address}`,
        );
        return;
      }
    }

    // Space Id not found in store, so load it from the contract
    const handle = router.query.handle as string;

    async function getSpace(): Promise<void> {
      try {
        const space: EmbraceSpaces.SpaceStructOutput =
          await spacesContract?.getSpaceFromHandle(handle);

        if (space) {
          setSpaceData(SpaceUtil.from_dto(space));
          setIsFounder(space.founder === address);
        }
      } catch (err: any) {
        // Space handle doesn't exist - redirect to home page
        router.push("/");
        console.error(`An error occured getting the space data ${err.message}`);
      }
    }

    getSpace();
  }, [
    address,
    getSpaceByIdSelector,
    router,
    router.query.handle,
    router.query.spaceId,
    routerIsReady,
    spaceData,
    spacesContract,
  ]);

  // Once space data is loaded then get the space metadata
  useEffect(() => {
    async function loadSpaceMetadata() {
      if (!spaceData || metadataLoaded) return;

      // if metadata is an object then it's already loaded so no need to fetch from ipfs
      if (!spaceData?.loadedMetadata && spaceData?.metadata) {
        const metadata = (await getIpfsJsonContent(
          spaceData.metadata,
        )) as SpaceMetadata;

        if (metadata?.image) {
          metadata.image = getFileUri(metadata.image);
        }

        setSpaceData({ ...spaceData, loadedMetadata: metadata });
        setMetadataLoaded(true);
      }
    }

    loadSpaceMetadata();
  }, [spaceData, metadataLoaded]);

  // Get the member information for the connected address and the members count
  useEffect(() => {
    async function getMembershipInfo(): Promise<void> {
      if (!spacesContract || !spaceData?.id || !address || membershipInfoLoaded)
        return;

      const spaceId = BigNumber.from(spaceData.id!).toNumber();

      const _accountMembership = await spacesContract?.getSpaceMember(
        spaceId,
        address,
      );

      setAccountMembership(_accountMembership);
      setMembershipInfoLoaded(true);
    }

    getMembershipInfo();
  }, [spacesContract, spaceData?.id, membershipInfoLoaded, address]);

  useEffect(() => {
    async function getMembershipCount(): Promise<void> {
      if (!spacesContract || !spaceData?.id || spaceData?.memberCount) return;

      const spaceId = BigNumber.from(spaceData.id!).toNumber();
      const memberCount = await spacesContract?.getMemberCount(spaceId);
      const memberCountNumber = BigNumber.from(memberCount).toNumber();

      setSpaceData((previous): Space => {
        return {
          ...previous,
          memberCount: memberCountNumber,
        } as Space;
      });
    }

    getMembershipCount();
  }, [spacesContract, spaceData?.id, spaceData?.memberCount]);

  const joinSpace = async () => {
    if (!spacesContract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.id).toNumber();

    try {
      setJoinSpaceLoading(true);
      const tx = await spacesContract.joinSpace(spaceId);
      await tx.wait();

      setAccountMembership({
        isActive: true,
        isAdmin: false,
        isRequest: false,
      });

      setSpaceData((previous): Space => {
        return {
          ...previous,
          memberCount: spaceData?.memberCount! + 1,
        } as Space;
      });

      setJoinSpaceLoading(false);

      // If spaces store has any community spaces then find it and move to yourSpaces
      dispatch(moveJoinedToYourSpaces(spaceId));
    } catch (err) {
      console.log("joinSpace", err);
      setJoinSpaceLoading(false);
    }
  };

  const requestJoinSpace = async () => {
    if (!spacesContract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.id).toNumber();

    try {
      setJoinSpaceLoading(true);
      const tx = await spacesContract.requestJoin(spaceId, {
        gasLimit: 1000000, // For some reason errors if this is not set - cannot estimate gas
      });
      await tx.wait();

      setAccountMembership({
        isActive: false,
        isAdmin: false,
        isRequest: true,
      });

      setJoinSpaceLoading(false);
    } catch (err) {
      console.log("requestJoin", err);
      setJoinSpaceLoading(false);
    }
  };

  return (
    <>
      <AppLayout title={spaceData?.loadedMetadata?.name}>
        {spaceData?.loadedMetadata ? (
          <>
            <Header
              space={spaceData}
              isFounder={isFounder}
              accountMembership={accountMembership}
              membershipInfoLoaded={membershipInfoLoaded}
              joinSpace={joinSpace}
              requestJoinSpace={requestJoinSpace}
              joinSpaceLoading={joinSpaceLoading}
            />
            <Apps
              space={spaceData}
              query={router.query}
              accountMembership={accountMembership}
            />
          </>
        ) : (
          <div className="w-full justify-center p-10">
            <Spinner />
          </div>
        )}
      </AppLayout>
    </>
  );
}
