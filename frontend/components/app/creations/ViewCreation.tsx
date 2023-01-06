import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
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
import { useProvider } from "wagmi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { RootState } from "../../../store/store";
import { Collection, Creation } from "../../../types/space-apps";
import {
  getCreationById,
  getCollectionById,
  setCollectionCreations,
} from "../../../store/slices/creations";
import { setCid } from "../../../store/slices/metadata";
import { livepeerApiKey } from "../../../lib/envs";
import classNames from "classnames";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: livepeerApiKey,
  }),
});

export default function ViewCreation({
  space,
  collectionId,
  creationId,
}: {
  space: Space;
  collectionId: number;
  creationId: number;
}) {
  const provider = useProvider();
  const creationsStore = useAppSelector((state: RootState) => state.creations);
  const metadataStore = useAppSelector((state: RootState) => state.metadata);
  const getCreationByIdSelector = useAppSelector(getCreationById);
  const getCollectionByIdSelector = useAppSelector(getCollectionById);
  const dispatch = useAppDispatch();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [creation, setCreation] = useState<any>();

  const [selectedCollection, setSelectedCollection] = useState<Collection>();

  // Set the collection information - from store or contract
  useEffect(() => {
    if (!appCreationsContract || !provider || !collectionId) return;

    const loadCollection = async () => {
      const collection = await appCreationsContract.getCollection(
        space.id,
        collectionId,
      );

      if (!collection) return;

      setSelectedCollection(collection);
    };

    // Get collection info from store if exists
    const _collection = getCollectionByIdSelector(collectionId);

    if (_collection) {
      setSelectedCollection(_collection);
    } else {
      // From contract
      loadCollection();
    }
  }, [
    appCreationsContract,
    provider,
    collectionId,
    getCollectionByIdSelector,
    space.id,
  ]);

  // TODO: Currently all the creations are loaded from the collection before loading this current creation
  // even if the creation already exists in the store
  // Once the current creation is loaded load all the other creations for this collection
  useEffect(() => {
    if (creation?.tokenId == creationId || !selectedCollection) return;

    const loadCreations = async () => {
      // Get the selected collection contract address and create a new contract instance
      const collectionContractAddress = selectedCollection.contractAddress;

      // Get the creations for this collection
      const collectionContract = new ethers.Contract(
        collectionContractAddress,
        appCreationCollectionsABI,
        provider,
      );

      if (!collectionContract) return;

      const creations: Creation[] = await collectionContract.getAllTokensData();

      if (!creations.length) return;

      const formattedCreations: Creation[] = [];

      for (let i = 0; i < creations.length; i++) {
        const _creation = {
          tokenId: BigNumber.from(creations[i].tokenId).toNumber(),
          tokenURI: creations[i].tokenURI.replace("ipfs://", ""),
          owner: creations[i].owner,
        };

        if (_creation.tokenId === creationId) {
          setCreation(_creation);

          console.log("setCreation", _creation);
        }

        formattedCreations.push(_creation);

        const cid = _creation.tokenURI;

        if (!metadataStore.cidData[cid]) {
          // If not, load it from IPFS
          const loadedMetadata = (await getIpfsJsonContent(cid)) as any;

          if (loadedMetadata?.image) {
            const imageCid = loadedMetadata?.image.replace("ipfs://", "");
            const imageUri = getFileUri(imageCid);
            loadedMetadata.image = imageUri;
          }

          loadedMetadata.tokenId = creationId;

          dispatch(setCid({ cid, data: loadedMetadata }));

          console.log("dispatch setCid", loadedMetadata);
        }
      }

      dispatch(
        setCollectionCreations({
          collectionId: selectedCollection.id,
          creations: formattedCreations,
        }),
      );

      console.log("dispatch setCollectionCreations", formattedCreations);
    };

    // Set the creation from the store if it exists
    const _creation = getCreationByIdSelector(collectionId, creationId);

    if (_creation) {
      setCreation(_creation);
    }

    // Load all other creations for this collection
    loadCreations();
  }, [
    appCreationCollectionsABI,
    collectionId,
    creation,
    creationId,
    dispatch,
    getCreationByIdSelector,
    metadataStore.cidData,
    provider,
    selectedCollection,
  ]);

  return (
    <LivepeerConfig client={livepeerClient}>
      <Link href={`/${space.handle}/creations?collectionId=${collectionId}`}>
        <Button additionalClassName="p-2 mb-5">back</Button>
      </Link>

      {creation ? (
        <div className="w-full flex flex-row grow">
          <div className="w-full flex flex-col justify-center items-center">
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
                <div className="w-2/3 justify-center p-2">
                  <Player
                    title={metadataStore.cidData[creation.tokenURI]?.name}
                    src={
                      metadataStore.cidData[creation.tokenURI]?.animation_url
                    }
                    autoPlay={false}
                    objectFit="contain"
                    poster={metadataStore.cidData[creation.tokenURI]?.image}
                    muted={false}
                    autoUrlUpload={{
                      fallback: true,
                      ipfsGateway: "https://cloudflare-ipfs.com",
                    }}
                  />

                  <div className="w-full flex justify-left p-2">
                    <h1 className="text-2xl font-bold">
                      {metadataStore.cidData[creation.tokenURI]?.name}
                    </h1>
                  </div>

                  <div className="w-full flex justify-left p-2">
                    <p className="text-sm">
                      {metadataStore.cidData[creation.tokenURI]?.description}
                    </p>
                  </div>
                </div>
              </>
            }
          </div>

          <div
            className={classNames({
              "hidden w-1/5 h-1/2 ml-10 p-2 pt-0": true,
              "md:flex md:flex-col":
                creationsStore.creations[collectionId] &&
                creationsStore.creations[collectionId].length > 1,
            })}
          >
            {creationsStore.creations[collectionId] &&
              creationsStore.creations[collectionId].length > 1 && (
                <>
                  <ul
                    role="list"
                    className="w-full max-h-screen overflow-scroll"
                  >
                    <h1 className="mb-3 underline">
                      {selectedCollection?.name} collection
                    </h1>

                    {creationsStore.creations[collectionId] &&
                      creationsStore.creations[collectionId]
                        .filter((creation) => creation.tokenId !== creationId)
                        .map((creation, i) => (
                          <Link
                            href={`/${space.handle}/creations?collectionId=${collectionId}&creationId=${creation.tokenId}`}
                            key={creation.tokenId}
                          >
                            {metadataStore.cidData[creation.tokenURI] && (
                              <li className="relative">
                                <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                                  <Image
                                    src={
                                      metadataStore.cidData[creation.tokenURI]
                                        ?.image
                                    }
                                    alt={
                                      metadataStore.cidData[creation.tokenURI]
                                        ?.name
                                    }
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
                                      Open{" "}
                                      {
                                        metadataStore.cidData[creation.tokenURI]
                                          ?.name
                                      }
                                    </span>
                                  </button>
                                </div>
                                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                                  {
                                    metadataStore.cidData[creation.tokenURI]
                                      ?.name
                                  }
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
