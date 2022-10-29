import AppLayout from "../../components/AppLayout";
import { useRouter } from "next/router";
import { useContext } from "react";
import { SpaceContext } from "../../lib/SpaceContext";
import Discussion from "../../components/app/discussion";
import { chains } from "@web3modal/ethereum";
import { useContractRead } from "@web3modal/react";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";

export default function SpaceViewPage() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const handle = useRouter().query.handle;

  const config = {
    address: process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    abi: embraceSpacesContract.abi,
    functionName: "getIdFromHandle",
    chainId: chains.goerli.id,
  };
  const { data, error, isLoading, refetch } = useContractRead(config);

  // use handle to get spaceId from contract
  const spaceIdFromHandle = 99999;
  setSpaceId(spaceIdFromHandle);

  console.log("Data", data);
  console.error("Error", error);

  if (!spaceId) {
    <>Space could not be found</>;
  }
  return (
    <>
      <AppLayout title="Get Space Name from Handle">
        <h1>Space View # {spaceId}</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error...</p>}
        {data && <p>data</p>}
        <Discussion />
      </AppLayout>
    </>
  );
}
