import AppLayout from "../../components/AppLayout";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { SpaceContext } from "../../lib/SpaceContext";
import Discussion from "../../components/app/discussion";
import { ethers } from "ethers";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import { useSigner } from "@web3modal/react";

export default function SpaceViewPage() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const { data: signer } = useSigner();
  const router = useRouter();
  const routerIsReady = router.isReady;

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    embraceSpacesContract.abi,
    signer
  );

  useEffect((): void => {
    if (!contract || !routerIsReady) return;

    async function getSpaceId(MyContract): Promise<void> {
      try {
        const handleBytes32 = ethers.utils.formatBytes32String(
          router.query.handle as string
        );
        const response = await MyContract.getIdFromHandle(handleBytes32);
        if (response.toString() !== "0") {
          setSpaceId(Number(response.toString()));
        }
      } catch (err) {
        console.log(err);
      }
    }

    getSpaceId(contract);
  }, [contract, routerIsReady]);

  useEffect((): void => {
    if (!contract || !routerIsReady || spaceId == -1) return;

    async function getSpace(MyContract): Promise<void> {
      try {
        console.log("SPACE", spaceId);
        const response = await MyContract.getSpace(3);
        console.log("GET SPACE", response);
      } catch (err) {
        console.log(err);
      }
    }

    getSpace(contract);
  }, [contract, routerIsReady, spaceId]);

  return (
    <>
      <AppLayout title="Get Space Name from Handle">
        {spaceId !== -1 ? (
          <>
            <h1>Space View # {spaceId}</h1>
            <Discussion />
          </>
        ) : (
          <></>
        )}
      </AppLayout>
    </>
  );
}
