import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSigner, useAccount } from "wagmi";
import AppLayout from "../../components/AppLayout";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import Spinner from "../../components/Spinner";
import getIpfsJsonContent from "../../lib/web3storage/getIpfsJsonContent";
import Header from "../../components/space/Header";
import Apps from "../../components/space/Apps";
import { EmbraceSpace, SpaceMembership } from "../../utils/types";

export default function SpaceViewPage() {
  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const [spaceData, setSpaceData] = useState<any>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<any>(false);
  const [contract, setContract] = useState<Contract>();
  const [memberInfoLoaded, setMemberInfoLoaded] = useState<boolean>(false);
  const [isFounder, setIsFounder] = useState<boolean>(false);
  const [membership, setMembership] = useState<SpaceMembership>();
  const [connectedAddress, setConnectedAddress] = useState<string>("");

  const router = useRouter();
  const routerIsReady = router.isReady;
  // Check if the account is a member of the space - must call contract isMember
  // Check if account meets the membership requirements - must call contract meetsGateRequirements

  const account = useAccount();

  useEffect(() => {
    if (account.address) {
      setConnectedAddress(account.address);
    }
  }, [account]);

  // Once router is ready and signer is loaded then initialize the contract
  // useEffect(() => {
  //   if (!routerIsReady || isSignerLoading || contract) return;

  //   if (signer) {
  //     const spacesContract = new Contract(
  //       process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
  //       embraceSpacesContract.abi,
  //       (signer as Signer) ||
  //         new ethers.providers.Web3Provider((window as any).ethereum)
  //     );
  //   }

  //   console.log(isSignerLoading, signer, "SIGNER");

  //   setContract(spacesContract);
  // }, [routerIsReady, signer, isSignerLoading, contract]);

  // Once the signer is loaded, initialize the accounts contract
  useEffect((): void => {
    if (isSignerLoading) return;

    if (signer) {
      const spacesContract = new Contract(
        process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
        embraceSpacesContract.abi,
        signer as Signer
      );

      console.log(signer, "SIGNER");
      setContract(spacesContract);

      return;
    }

    const spacesContract = new Contract(
      process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
      embraceSpacesContract.abi,
      new ethers.providers.Web3Provider((window as any).ethereum)
    );

    setContract(spacesContract);
  }, [signer, isSignerLoading]);

  // Once contract is initialized then get the space Id from the router handle and load the space data
  useEffect((): void => {
    if (!contract || !routerIsReady || spaceData) return;

    const handleBytes32 = ethers.utils.formatBytes32String(
      router.query.handle as string
    );

    async function getSpace(MyContract: Contract): Promise<void> {
      try {
        const space: EmbraceSpace = await MyContract.getSpaceFromHandle(
          handleBytes32
        );

        if (space) {
          // const apps = space.apps.map((app) => BigNumber.from(app).toNumber());
          const apps = [0, 1, 2]; // TODO: temp for testing
          const updatedSpace = { ...space, apps };
          setSpaceData(updatedSpace);
          setIsFounder(space.founder === connectedAddress);
        }
      } catch (err) {
        console.log(
          "getSpaceId",
          err,
          contract,
          router.query.handle,
          handleBytes32
        );
      }
    }

    getSpace(contract);
  }, [contract]);

  // Once space data is loaded then get the space metadata
  useEffect(() => {
    if (!spaceData || metadataLoaded) return;

    async function loadSpaceMetadata() {
      const metadata = (await getIpfsJsonContent(
        spaceData.metadata,
        "readAsText"
      )) as Record<string, any>;

      if (metadata?.image) {
        metadata.image = (await getIpfsJsonContent(
          metadata.image,
          "readAsDataURL"
        )) as string;
      }

      // Update the spaceData object with the loaded metadata
      const spaceDataObj = { ...spaceData, metadata };

      setSpaceData(spaceDataObj);
      setMetadataLoaded(true);
    }

    loadSpaceMetadata();
  }, [spaceData, metadataLoaded]);

  // Get the member count
  useEffect(() => {
    if (!contract || !spaceData || memberInfoLoaded) return;

    async function getMemberInfo(MyContract: Contract): Promise<void> {
      const spaceId = BigNumber.from(spaceData.index).toNumber();
      const memberCount = await MyContract.getMemberCount(spaceId);
      const memberCountNumber = BigNumber.from(memberCount).toNumber();

      if (connectedAddress) {
        const membership = await MyContract.getSpaceMember(
          spaceId,
          connectedAddress
        );

        setMembership(membership);
      }

      const spaceDataObj = { ...spaceData, memberCount: memberCountNumber };

      setSpaceData(spaceDataObj);
      setMemberInfoLoaded(true);
    }

    getMemberInfo(contract);
  }, [contract, spaceData, metadataLoaded]);

  const joinSpace = async () => {
    if (!contract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.index).toNumber();

    try {
      const tx = await contract.joinSpace(spaceId, {
        gasLimit: 1000000,
      });
      await tx.wait();
    } catch (err) {
      console.log("joinSpace", err);
    }
  };

  const requestJoinSpace = async () => {
    if (!contract || !spaceData) return;

    const spaceId = BigNumber.from(spaceData.index).toNumber();

    try {
      const tx = await contract.requestJoin(spaceId, {
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
        {spaceData && metadataLoaded && memberInfoLoaded ? (
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
