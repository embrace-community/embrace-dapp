import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import useSigner from "../../../hooks/useSigner";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../../../lib/web3storage/getIpfsJsonContent";
import Button from "../../Button";
import { Player } from "@livepeer/react";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_STUDIO_API_KEY,
  }),
});

export default function ViewCreation({
  spaceId,
  collectionId,
  creationId,
}: {
  spaceId: number;
  collectionId: number;
  creationId: number;
}) {
  const router = useRouter();
  const { signer } = useSigner();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [creation, setCreation] = useState<any>({});
  const [creationLoaded, setCreationLoaded] = useState<boolean>(false);

  // Load the collections for this space
  useEffect(() => {
    if (!appCreationsContract || !signer || Object.keys(creation).length > 0)
      return;

    const loadCreation = async () => {
      const collection = await appCreationsContract.getCollection(
        spaceId,
        collectionId,
      );

      if (!collection) return;

      // Get the selected collection contract address and create a new contract instance
      const collectionContractAddress = collection.contractAddress;

      // Get the creations for this collection
      const collectionContract = new ethers.Contract(
        collectionContractAddress,
        appCreationCollectionsABI,
        signer,
      );

      const creationURI = await collectionContract.tokenURI(creationId);

      // Now if CID has not been loaded then load it
      console.log(creationURI, "tokenURI");

      // TODO: Otherwise get from store

      const cid = creationURI.replace("ipfs://", "");
      const creationMetadata = await getIpfsJsonContent(cid);

      if (creationMetadata?.image) {
        const imageCid = creationMetadata?.image.replace("ipfs://", "");
        const imageUri = getFileUri(imageCid);
        creationMetadata.image = imageUri;
      }

      console.log(creationMetadata, "loadedMetadata");

      setCreation(creationMetadata);
      setCreationLoaded(true);
    };

    loadCreation();
  }, [
    appCreationCollectionsABI,
    appCreationsContract,
    collectionId,
    creation,
    creationId,
    signer,
    spaceId,
  ]);

  return (
    <LivepeerConfig client={livepeerClient}>
      <Button
        additionalClassName="p-2 mb-5"
        buttonProps={{ onClick: () => router.back() }}
      >
        Back
      </Button>

      <div className="w-full flex justify-center">
        {/* <Image
          src={creation.image}
          alt={creation.name}
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto max-h-screen"
        /> */}
        {creationLoaded && (
          <Player
            title={creation.name}
            src={creation.animation_url}
            autoPlay={false}
            objectFit="contain"
            poster={creation.image}
            muted={false}
            autoUrlUpload={{
              fallback: true,
              ipfsGateway: "https://cloudflare-ipfs.com",
            }}
          />
        )}
      </div>

      <div className="w-full flex justify-center">
        <h1 className="text-2xl font-bold">{creation.name}</h1>
      </div>

      <div className="w-full flex justify-center">
        <p className="text-sm">{creation.description}</p>
      </div>
    </LivepeerConfig>
  );
}
