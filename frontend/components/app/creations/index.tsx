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
import { BigNumber, ethers } from "ethers";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../../../lib/web3storage/getIpfsJsonContent";
import Spinner from "../../Spinner";
import { useProvider } from "wagmi";
import { Collection, Creation } from "../../../types/space-apps";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setLoaded,
  setSpaceId,
  setCollections,
  setCollectionCreations,
} from "../../../store/slices/creations";
import { RootState } from "../../../store/store";
import { setCid } from "../../../store/slices/metadata";

export default function Creations({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const provider = useProvider();
  const creationsStore = useAppSelector((state: RootState) => state.creations);
  const metadataStore = useAppSelector((state: RootState) => state.metadata);
  const dispatch = useAppDispatch();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [selectedCollection, setSelectedCollection] = useState<Collection>();
  const [creationsDataLoaded, setCreationsDataLoaded] = useState<
    "loading" | "loaded" | null
  >(null);
  const creationId = Number(query.creationId);
  const collectionId = Number(query.collectionId);
  const newCollectionInput = useRef<HTMLInputElement>(null);
  const view = query.view as string;

  console.log(space, "space");

  useEffect(() => {
    if (
      !appCreationsContract ||
      !provider ||
      creationsStore.spaceId === space.id
    )
      return;

    console.log("setSpaceId");
    dispatch(setSpaceId(space.id));
    // TODO: Clear collections and creations
    dispatch(setLoaded(false));
  }, [
    appCreationsContract,
    creationsStore.spaceId,
    dispatch,
    provider,
    space.id,
  ]);

  // Load the collections for this space
  useEffect(() => {
    if (!appCreationsContract || selectedCollection || !creationsStore.spaceId)
      return;

    const loadCollections = async () => {
      console.log("loadCollections");
      if (
        creationsStore.spaceId === space.id &&
        creationsStore.collections.length > 0
      ) {
        // If the collections are already loaded
        setSelectedCollection(creationsStore.collections[0]);
      } else {
        const spaceCollections: Collection[] =
          await appCreationsContract.getCollections(space.id);

        const formattedCollections: Collection[] = [];

        for (let i = 0; i < spaceCollections.length; i++) {
          formattedCollections.push({
            id: BigNumber.from(spaceCollections[i].id).toNumber(),
            name: spaceCollections[i].name,
            contractAddress: spaceCollections[i].contractAddress,
          });
        }

        dispatch(setCollections(formattedCollections));
        setSelectedCollection(formattedCollections[0]);
      }
    };

    loadCollections();
  }, [
    appCreationsContract,
    creationsStore.collections,
    creationsStore.spaceId,
    dispatch,
    selectedCollection,
    space.id,
  ]);

  // Load the collections for this space
  useEffect(() => {
    if (!appCreationsContract || !selectedCollection || !creationsStore.spaceId)
      return;

    const loadCreations = async () => {
      if (!creationsStore.creations[selectedCollection.id]) {
        // Get the selected collection contract address and create a new contract instance
        const collectionContractAddress = selectedCollection?.contractAddress;

        // Get the creations for this collection
        const collectionContract = new ethers.Contract(
          collectionContractAddress,
          appCreationCollectionsABI,
          provider,
        );

        const creations: Creation[] =
          await collectionContract.getAllTokensData();

        if (!creations.length) return;

        const formattedCreations: Creation[] = [];

        for (let i = 0; i < creations.length; i++) {
          console.log("creation!!", creations[i]);

          formattedCreations.push({
            tokenId: BigNumber.from(creations[i].tokenId).toNumber(),
            tokenURI: creations[i].tokenURI.replace("ipfs://", ""),
            owner: creations[i].owner,
          });
        }

        if (!formattedCreations.length) {
          setCreationsDataLoaded("loaded");
          return;
        }

        dispatch(
          setCollectionCreations({
            collectionId: selectedCollection.id,
            creations: formattedCreations,
          }),
        );

        // To trigger loading metadata
        setCreationsDataLoaded(null);

        console.log("creations!", creations);
      }
    };

    loadCreations();
  }, [
    appCreationCollectionsABI,
    selectedCollection?.contractAddress,
    provider,
    appCreationsContract,
    selectedCollection,
    creationsStore.spaceId,
    space.id,
    dispatch,
    creationsStore.creations,
  ]);

  useEffect(() => {
    if (
      creationsDataLoaded == "loaded" ||
      creationsDataLoaded == "loading" ||
      !selectedCollection
    )
      return;

    async function loadMetadataJson() {
      if (!selectedCollection) return;

      console.log("creations", creationsStore.creations[selectedCollection.id]);
      console.log("metadata start", creationsDataLoaded);

      if (
        !creationsStore.creations[selectedCollection.id] ||
        creationsStore.creations[selectedCollection.id]?.length == 0
      ) {
        setCreationsDataLoaded("loaded");
        return;
      }

      for (const creation of creationsStore.creations[selectedCollection.id]) {
        setCreationsDataLoaded("loading");
        const cid = creation.tokenURI;

        // If not, load it from IPFS
        const loadedMetadata = (await getIpfsJsonContent(cid)) as any;

        if (!loadedMetadata) continue;

        if (loadedMetadata?.image) {
          const imageCid = loadedMetadata?.image.replace("ipfs://", "");
          const imageUri = getFileUri(imageCid);
          loadedMetadata.image = imageUri;
        }

        loadedMetadata.tokenId = creation.tokenId;

        dispatch(setCid({ cid, data: loadedMetadata }));
      }

      setCreationsDataLoaded("loaded");
    }

    loadMetadataJson();
  }, [
    creationsDataLoaded,
    creationsStore.creations,
    dispatch,
    metadataStore,
    selectedCollection,
  ]);

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
          {creationsStore.collections.length > 0 && (
            <>
              <h1 className="text-lg font-medium leading-6 embracedark underline sm:truncate mb-5">
                Collections
              </h1>
              {creationsStore.collections.map((collection) => (
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
            </>
          )}

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

          {selectedCollection && (
            <>
              <ul
                role="list"
                className="w-full grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 xl:gap-x-8"
              >
                {creationsStore.creations[selectedCollection.id] &&
                  creationsStore.creations[selectedCollection.id].map(
                    (creation, i) => (
                      <Link
                        href={`/${query.handle}/creations?collectionId=${selectedCollection.id}&creationId=${creation.tokenId}`}
                        key={creation.tokenId}
                      >
                        {metadataStore.cidData[creation.tokenURI] && (
                          <li className="relative">
                            <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                              <Image
                                src={
                                  metadataStore.cidData[creation.tokenURI]
                                    ?.image
                                }
                                alt={
                                  metadataStore.cidData[creation.tokenURI]?.name
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
                              {metadataStore.cidData[creation.tokenURI]?.name}
                            </p>
                            <p className="pointer-events-none block text-sm font-medium text-gray-500"></p>
                          </li>
                        )}
                      </Link>
                    ),
                  )}
              </ul>
              {/* Displayed if some creations metadata has loaded but not all */}
              {creationsDataLoaded !== "loaded" && (
                <Spinner itemsCenter={false} />
              )}

              {creationsDataLoaded == "loaded" &&
                (!creationsStore.creations[selectedCollection.id] ||
                  creationsStore.creations[selectedCollection.id].length ==
                    0) && <>No creations exist in this collection</>}
            </>
          )}
        </div>
      </>
    </div>
  );
}
