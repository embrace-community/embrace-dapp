import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import AppLayout from "../../components/AppLayout";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import Spinner from "../../components/Spinner";
import getIpfsJsonContent from "../../lib/web3storage/getIpfsJsonContent";
import Header from "../../components/space/Header";
import Apps from "../../components/space/Apps";
import { EmbraceSpace } from "../../utils/types";

export default function SpaceViewPage({ props }) {
  const [spaceData, setSpaceData] = useState<any>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<any>(false);
  const [contract, setContract] = useState<Contract>();
  const [memberCountLoaded, setMemberCountLoaded] = useState<boolean>(false);
  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const router = useRouter();
  const routerIsReady = router.isReady;

  // Once router is ready and signer is loaded then initialize the contract
  useEffect(() => {
    if (!routerIsReady || isSignerLoading || contract) return;

    const newContract = new Contract(
      process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
      embraceSpacesContract.abi,
      (signer as Signer) ||
        new ethers.providers.Web3Provider((window as any).ethereum)
    );

    setContract(newContract);
  }, [routerIsReady, signer, isSignerLoading, contract]);

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
    if (!contract || !spaceData || memberCountLoaded) return;

    async function getMemberCount(MyContract: Contract): Promise<void> {
      const spaceId = BigNumber.from(spaceData.index).toNumber();
      const memberCount = await MyContract.getMemberCount(spaceId);

      const memberCountNumber = BigNumber.from(memberCount).toNumber();

      const spaceDataObj = { ...spaceData, memberCount: memberCountNumber };

      setSpaceData(spaceDataObj);
      setMemberCountLoaded(true);
    }

    getMemberCount(contract);
  }, [contract, spaceData, metadataLoaded]);

  return (
    <>
      <AppLayout title={spaceData?.metadata?.name}>
        {spaceData && metadataLoaded && memberCountLoaded ? (
          <>
            <Header space={spaceData} />
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
