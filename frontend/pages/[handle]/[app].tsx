import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import AppLayout from "../../components/AppLayout";
import useEmbraceContracts from "../../hooks/useEmbraceContracts";
import Spinner from "../../components/Spinner";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../../lib/web3storage/getIpfsJsonContent";
import Header from "../../components/space/Header";
import Apps from "../../components/space/Apps";
import { Space, SpaceMembership } from "../../types/space";
import { useAppSelector } from "../../store/hooks";
import { getSpaceById } from "../../store/slices/space";

export default function SpaceViewPage() {
  const { spacesContract } = useEmbraceContracts();
  const [spaceData, setSpaceData] = useState<any>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<any>(false);
  const [memberInfoLoaded, setMemberInfoLoaded] = useState<boolean>(false);
  const [isFounder, setIsFounder] = useState<boolean>(false);
  const [membership, setMembership] = useState<SpaceMembership>();
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const getSpaceByIdSelector = useAppSelector(getSpaceById);

  const router = useRouter();
  const routerIsReady = router.isReady;
  const account = useAccount();

  // Set the connected account
  useEffect(() => {
    if (account.address) {
      setConnectedAddress(account.address);
    }
  }, [account]);

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
        setIsFounder(space.founder === connectedAddress);
        return;
      }
    }

    // Space Id not found in store, so load it from the contract
    const handleBytes32 = ethers.utils.formatBytes32String(
      router.query.handle as string
    );

    async function getSpace(): Promise<void> {
      try {
        const space: Space = await spacesContract?.getSpaceFromHandle(
          handleBytes32
        );

        if (space) {
          const apps = space.apps.map((app) => BigNumber.from(app).toNumber());
          // const apps = [0, 1, 2]; // TODO: temp for testing
          const updatedSpace = { ...space, apps };
          setSpaceData(updatedSpace);
          setIsFounder(space.founder === connectedAddress);
        }
      } catch (err) {
        console.log(
          "getSpace",
          err,
          spacesContract,
          router.query.handle,
          handleBytes32
        );
      }
    }

    getSpace();
  }, [routerIsReady]);

  // Once space data is loaded then get the space metadata
  useEffect(() => {
    if (!spaceData || metadataLoaded) return;

    async function loadSpaceMetadata() {
      const metadata = (await getIpfsJsonContent(spaceData.metadata)) as Record<
        string,
        any
      >;

      if (metadata?.image) {
        metadata.image = getFileUri(metadata.image);
      }

      // Update the spaceData object with the loaded metadata
      const spaceDataObj = { ...spaceData, metadata };

      setSpaceData(spaceDataObj);
      setMetadataLoaded(true);
    }

    loadSpaceMetadata();
  }, [spaceData, metadataLoaded]);

  // Get the member information for the connected address
  useEffect(() => {
    if (!spacesContract || !spaceData || memberInfoLoaded) return;

    async function getMemberInfo(): Promise<void> {
      const spaceId = BigNumber.from(spaceData.id).toNumber();
      const memberCount = await spacesContract?.getMemberCount(spaceId);
      const memberCountNumber = BigNumber.from(memberCount).toNumber();

      if (connectedAddress) {
        const membership = await spacesContract?.getSpaceMember(
          spaceId,
          connectedAddress
        );

        setMembership(membership);
      }

      const spaceDataObj = { ...spaceData, memberCount: memberCountNumber };

      setSpaceData(spaceDataObj);
      setMemberInfoLoaded(true);
    }

    getMemberInfo();
  }, [spacesContract, spaceData, metadataLoaded]);

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
      <AppLayout title={spaceData?.metadata?.name}>
        {spaceData && metadataLoaded ? (
          <>
            <Header
              space={spaceData}
              isFounder={isFounder}
              membership={membership}
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
