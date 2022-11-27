import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
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
import { useAppSelector } from "../../store/hooks";
import { getSpaceById } from "../../store/slices/space";
import { Space, SpaceMembership, SpaceMetadata } from "../../types/space";
import { SpaceUtil } from "../../types/space-type-utils";

export default function SpaceViewPage() {
  const { spacesContract } = useEmbraceContracts();

  const [spaceData, setSpaceData] = useState<Space | null>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(false);

  const [isFounder, setIsFounder] = useState<boolean>(false);
  const [membershipInfoLoaded, setMembershipInfoLoaded] =
    useState<boolean>(false);
  const [membership, setMembership] = useState<SpaceMembership>();
  const getSpaceByIdSelector = useAppSelector(getSpaceById);

  const router = useRouter();
  const routerIsReady = router.isReady;
  const { address } = useAccount();

  // Once contract is initialized then get the space Id from the router handle and load the space data
  useEffect((): void => {
    if (!routerIsReady || spaceData) return;

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
    const handleBytes32 = ethers.utils.formatBytes32String(
      router.query.handle as string,
    );

    async function getSpace(): Promise<void> {
      try {
        const space: EmbraceSpaces.SpaceStructOutput =
          await spacesContract?.getSpaceFromHandle(handleBytes32);

        if (space) {
          setSpaceData(SpaceUtil.from_dto(space));
          setIsFounder(space.founder === address);
        }
      } catch (err: any) {
        console.error(`An error occured getting the space data ${err.message}`);
      }
    }

    getSpace();
  }, [
    address,
    getSpaceByIdSelector,
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
      }

      setMetadataLoaded(true);
    }

    loadSpaceMetadata();
  }, [spaceData, metadataLoaded]);

  // Get the member information for the connected address
  useEffect(() => {
    async function getMembershipInfo(): Promise<void> {
      if (!spacesContract || !spaceData || membershipInfoLoaded) return;

      const spaceId = BigNumber.from(spaceData.id!).toNumber();
      const memberCount = await spacesContract?.getMemberCount(spaceId);
      const memberCountNumber = BigNumber.from(memberCount).toNumber();

      if (address) {
        const membership = await spacesContract?.getSpaceMember(
          spaceId,
          address,
        );

        setMembership(membership);
        setMembershipInfoLoaded(true);
      }

      setSpaceData({ ...spaceData, memberCount: memberCountNumber });
    }

    getMembershipInfo();
  }, [
    spacesContract,
    spaceData,
    metadataLoaded,
    membershipInfoLoaded,
    address,
  ]);

  const joinSpace = async () => {
    if (!spacesContract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.id).toNumber();

    try {
      const tx = await spacesContract.joinSpace(spaceId, {
        gasLimit: 1000000,
      });
      await tx.wait();
    } catch (err) {
      console.log("joinSpace", err);
    }
  };

  const requestJoinSpace = async () => {
    if (!spacesContract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.id).toNumber();

    try {
      const tx = await spacesContract.requestJoin(spaceId, {
        gasLimit: 1000000,
      });
      await tx.wait();
    } catch (err) {
      console.log("requestJoin", err);
    }
  };

  return (
    <>
      <AppLayout title={spaceData?.loadedMetadata?.name}>
        {spaceData && metadataLoaded ? (
          <>
            <Header
              space={spaceData}
              isFounder={isFounder}
              membership={membership}
              membershipInfoLoaded={membershipInfoLoaded}
              joinSpace={joinSpace}
              requestJoinSpace={requestJoinSpace}
            />
            <Apps space={spaceData} query={router.query} />
          </>
        ) : (
          <div className="p-10">
            <Spinner />
          </div>
        )}
      </AppLayout>
    </>
  );
}
