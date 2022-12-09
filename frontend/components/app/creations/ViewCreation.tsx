import { BigNumber, ethers } from "ethers";
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
import Spinner from "../../Spinner";
import Link from "next/link";
import { Space } from "../../../types/space";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY,
  }),
});

type Collection = {
  id: string;
  name: string;
  contractAddress: string;
};

type Creation = {
  tokenId: string;
  tokenURI: string;
  owner: string;
  loadedMetadata?: any;
};

export default function ViewCreation({
  space,
  collectionId,
  creationId,
}: {
  space: Space;
  collectionId: number;
  creationId: number;
}) {
  const router = useRouter();
  const { signer } = useSigner();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [creation, setCreation] = useState<any>({});
  const [creationLoaded, setCreationLoaded] = useState<boolean>(false);

  const [creations, setCreations] = useState<Creation[]>([]);
  const [creationsDataLoaded, setCreationsDataLoaded] = useState(false);
  const [creationsMetadata, setCreationsMetadata] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection>();

  // Load the collection vy id
  // useEffect(() => {
  //   if (!appCreationsContract) return;

  //   alert("loadCollection");

  //   const loadCollection = async () => {
  //     const spaceCollection = await appCreationsContract.getCollection(
  //       space.id,
  //       collectionId,
  //     );

  //     setSelectedCollection(spaceCollection);
  //   };

  //   loadCollection();
  // }, [appCreationsContract, collectionId, space.id]);

  // Load the creation metadata
  useEffect(() => {
    if (!appCreationsContract || !signer || creation.tokenId === creationId)
      return;

    const loadCreation = async () => {
      const collection = await appCreationsContract.getCollection(
        space.id,
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

      creationMetadata.tokenId = creationId;

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
    space.id,
  ]);

  // Load the collections for this space
  // useEffect(() => {
  //   if (!selectedCollection?.contractAddress || !signer) return;

  //   const loadCreations = async () => {
  //     // Get the selected collection contract address and create a new contract instance
  //     const collectionContractAddress = selectedCollection?.contractAddress;

  //     // Get the creations for this collection
  //     const collectionContract = new ethers.Contract(
  //       collectionContractAddress,
  //       appCreationCollectionsABI,
  //       signer,
  //     );

  //     const creations = await collectionContract.getAllTokensData();

  //     setCreations(
  //       creations.filter(
  //         (c) => BigNumber.from(c.tokenId).toNumber() !== creationId,
  //       ),
  //     );
  //     setCreationsDataLoaded(false);

  //     console.log("creations", creations);
  //   };

  //   loadCreations();
  // }, [
  //   appCreationCollectionsABI,
  //   creationId,
  //   selectedCollection?.contractAddress,
  //   signer,
  // ]);

  // useEffect(() => {
  //   if (creationsDataLoaded || creations.length == 0) return;

  //   async function loadMetadataJson() {
  //     console.log("creations", creations);
  //     console.log("metadata start", creationsDataLoaded);
  //     const _creationsMetadata = [];

  //     for (const creation of creations) {
  //       const cid = creation.tokenURI.replace("ipfs://", "");
  //       const loadedMetadata = await getIpfsJsonContent(cid);

  //       console.log("loadedMetadata", loadedMetadata);

  //       if (!loadedMetadata) continue;

  //       if (loadedMetadata?.image) {
  //         const imageCid = loadedMetadata?.image.replace("ipfs://", "");
  //         const imageUri = getFileUri(imageCid);
  //         loadedMetadata.image = imageUri;
  //       }

  //       loadedMetadata.tokenId = creation.tokenId;

  //       _creationsMetadata.push(loadedMetadata);

  //       console.log("metadata", _creationsMetadata);

  //       setCreationsMetadata(_creationsMetadata);
  //     }

  //     setCreationsDataLoaded(true);
  //   }

  //   loadMetadataJson();
  // }, [creations, creationsDataLoaded]);

  return (
    <LivepeerConfig client={livepeerClient}>
      <Button
        additionalClassName="p-2 mb-5"
        buttonProps={{ onClick: () => router.back() }}
      >
        Back
      </Button>

      {creationLoaded ? (
        <div className="w-full flex flex-row grow">
          <div className="w-full flex flex-col justify-center">
            {/* <Image
          src={creation.image}
          alt={creation.name}
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto max-h-screen"
        /> */}
            {
              <>
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

                <div className="w-full flex justify-left p-2">
                  <h1 className="text-2xl font-bold">{creation.name}</h1>
                </div>

                <div className="w-full flex justify-left p-2">
                  <p className="text-sm">{creation.description}</p>
                </div>
              </>
            }
          </div>

          <div className="hidden w-1/6 md:hidden flex-col ml-5 p-2 pt-0">
            {selectedCollection && creationsMetadata.length > 0 && (
              <>
                <ul role="list" className="w-full max-h-screen overflow-scroll">
                  <h1 className="mb-3 underline">
                    {selectedCollection.name} collection
                  </h1>
                  {creations.map((creation, i) => (
                    <Link
                      href={`/${space.handle}/creations?collectionId=${selectedCollection.id}&creationId=${creation.tokenId}`}
                      key={creation.tokenId}
                    >
                      {creationsMetadata[i] && (
                        <li className="relative">
                          <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                            <Image
                              src={creationsMetadata[i]?.image}
                              alt={creationsMetadata[i]?.name}
                              width="0"
                              height="0"
                              sizes="w-full"
                              className="pointer-events-none object-cover group-hover:opacity-75"
                            />
                            <button
                              type="button"
                              className="absolute inset-0 focus:outline-none"
                            >
                              <span className="sr-only">
                                Open {creationsMetadata[i]?.name}
                              </span>
                            </button>
                          </div>
                          <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                            {creationsMetadata[i]?.name}
                          </p>
                          <p className="pointer-events-none block text-sm font-medium text-gray-500"></p>
                        </li>
                      )}
                    </Link>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}
    </LivepeerConfig>
  );
}
