import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Router } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Space } from "../../../types/space";
import Button from "../../Button";
import CreateCreation from "./CreateCreation";
import ViewCreation from "./ViewCreation";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { ethers } from "ethers";
import useSigner from "../../../hooks/useSigner";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../../../lib/web3storage/getIpfsJsonContent";
import Spinner from "../../Spinner";

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

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const { signer } = useSigner();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [selectedCollection, setSelectedCollection] = useState<Collection>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [creationsDataLoaded, setCreationsDataLoaded] = useState(false);
  const [creationsMetadata, setCreationsMetadata] = useState([]);
  const creationId = Number(query.creationId);
  const collectionId = Number(query.collectionId);
  const newCollectionInput = useRef<HTMLInputElement>(null);
  const view = query.view as string;

  // Load the collections for this space
  useEffect(() => {
    if (!appCreationsContract) return;

    const loadCollections = async () => {
      const spaceCollections = await appCreationsContract.getCollections(
        space.id,
      );
      setCollections(spaceCollections);
      setSelectedCollection(spaceCollections[0]);
    };

    loadCollections();
  }, [appCreationsContract, space.id]);

  // Load the collections for this space
  useEffect(() => {
    if (!selectedCollection?.contractAddress || !signer) return;

    const loadCreations = async () => {
      // Get the selected collection contract address and create a new contract instance
      const collectionContractAddress = selectedCollection?.contractAddress;

      // Get the creations for this collection
      const collectionContract = new ethers.Contract(
        collectionContractAddress,
        appCreationCollectionsABI,
        signer,
      );

      const creations = await collectionContract.getAllTokensData();
      setCreations(creations);

      setCreationsDataLoaded(false);

      console.log("creations", creations);
    };

    loadCreations();
  }, [appCreationCollectionsABI, selectedCollection?.contractAddress, signer]);

  useEffect(() => {
    if (creationsDataLoaded) return;

    async function loadMetadataJson() {
      console.log("creations", creations);
      console.log("metadata start", creationsDataLoaded);

      if (creations.length == 0) {
        setCreationsDataLoaded(true);
        return;
      }

      const _creationsMetadata = [];

      for (const creation of creations) {
        const cid = creation.tokenURI.replace("ipfs://", "");
        const loadedMetadata = await getIpfsJsonContent(cid);

        console.log("loadedMetadata", loadedMetadata);

        if (!loadedMetadata) continue;

        if (loadedMetadata?.image) {
          const imageCid = loadedMetadata?.image.replace("ipfs://", "");
          const imageUri = getFileUri(imageCid);
          loadedMetadata.image = imageUri;
        }

        loadedMetadata.tokenId = creation.tokenId;

        _creationsMetadata.push(loadedMetadata);

        console.log("metadata", _creationsMetadata);

        setCreationsMetadata(_creationsMetadata);
      }

      setCreationsDataLoaded(true);
    }

    loadMetadataJson();
  }, [creations, creationsDataLoaded]);

  const createCollection = async () => {
    if (
      !appCreationsContract ||
      !newCollectionInput.current ||
      newCollectionInput.current?.value.length < 3
    )
      return;

    const collectionName = newCollectionInput.current?.value;

    const symbol = collectionName.substring(0, 5).toUpperCase();

    await appCreationsContract.createCollection(
      space.id,
      collectionName,
      symbol,
    );

    newCollectionInput.current.value = "";
  };

  if (view === "form") {
    return <CreateCreation id={creationId} />;
  }

  if (collectionId && creationId) {
    return (
      <ViewCreation
        space={space}
        collectionId={collectionId}
        creationId={creationId}
      />
    );
  }

  return (
    <div className="w-full flex flex-row grow">
      <>
        <div className="relative hidden md:w-1/5 md:flex flex-col my-1 sm:m-4 max-h-[calc(100vh-400px)]">
          <h1 className="text-lg font-medium leading-6 embracedark underline sm:truncate mb-5">
            Collections
          </h1>
          {collections.length > 0 &&
            collections.map((collection) => (
              <div
                key={collection.id}
                className={classNames({
                  "flex flex-row items-center justify-between p-2 rounded-lg cursor-pointer":
                    true,
                  "bg-gray-100":
                    selectedCollection &&
                    collection.id === selectedCollection.id,
                })}
                onClick={() => setSelectedCollection(collection)}
              >
                <span>{collection.name}</span>
              </div>
            ))}

          <div className="w-full mt-5 border-t p2 pt-5">
            <label
              htmlFor="collection"
              className="block text-sm font-medium text-gray-700"
            >
              New Collection
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="collection"
                id="collection"
                ref={newCollectionInput}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="collection name"
              />
            </div>
            <Button
              additionalClassName="p-1 mt-1"
              buttonProps={{
                onClick: () => {
                  createCollection();
                },
              }}
            >
              + new collection
            </Button>
          </div>
        </div>

        <div className="w-full flex flex-col my-1 sm:mb-4 ">
          <div className="flex flex-row items-center justify-between p-2 mb-5">
            <Link href={`/${query.handle}/creations?view=form`}>
              <Button additionalClassName="p-2">+ new creation</Button>
            </Link>
          </div>

          {selectedCollection && creationsMetadata.length > 0 && (
            <>
              <ul
                role="list"
                className="w-full grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 xl:gap-x-8"
              >
                {creations.map((creation, i) => (
                  <Link
                    href={`/${query.handle}/creations?collectionId=${selectedCollection.id}&creationId=${creation.tokenId}`}
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
              {/* Displayed if some creations metadata has loaded but not all */}
              {!creationsDataLoaded && <Spinner itemsCenter={false} />}

              {creationsDataLoaded && creations.length == 0 && (
                <>No creations exist in this collection</>
              )}
            </>
          )}
        </div>
      </>
    </div>
  );
}
