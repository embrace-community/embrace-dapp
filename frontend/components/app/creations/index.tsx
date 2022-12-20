import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Space, SpaceMembership } from "../../../types/space";
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
import { useAccount, useProvider } from "wagmi";
import { Collection, Creation } from "../../../types/space-apps";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setSpaceId,
  setCollections,
  setCollectionCreations,
  getCollectionById,
} from "../../../store/slices/creations";
import { RootState } from "../../../store/store";
import { setCid } from "../../../store/slices/metadata";
import useSigner from "../../../hooks/useSigner";

export default function Creations({
  query,
  space,
  membership,
}: {
  query: Router["query"];
  space: Space;
  membership: SpaceMembership | undefined;
}) {
  const provider = useProvider();
  const { address: accountAddress } = useAccount();
  const router = useRouter();
  const creationsStore = useAppSelector((state: RootState) => state.creations);
  const metadataStore = useAppSelector((state: RootState) => state.metadata);
  const getCollectionByIdSelector = useAppSelector(getCollectionById);
  const dispatch = useAppDispatch();
  const { appCreationsContract, appCreationCollectionsABI } = useAppContract();
  const [selectedCollection, setSelectedCollection] = useState<Collection>();
  const [creationsDataLoaded, setCreationsDataLoaded] = useState<
    "loading" | "loaded" | null
  >(null);
  const [collectionCreating, setCollectionCreating] = useState(false);
  const creationId = Number(query.creationId);
  const collectionId = Number(query.collectionId);
  const newCollectionInput = useRef<HTMLInputElement>(null);
  const view = query.view as string;

  useEffect(() => {
    if (
      !appCreationsContract ||
      !provider ||
      creationsStore.spaceId === space.id
    )
      return;

    dispatch(setSpaceId(space.id));
  }, [
    appCreationsContract,
    creationsStore.spaceId,
    dispatch,
    provider,
    space.id,
  ]);

  // Load the collections for this space
  useEffect(() => {
    if (!appCreationsContract || selectedCollection || !creationsStore?.spaceId)
      return;

    const loadCollections = async () => {
      if (
        creationsStore.spaceId === space.id &&
        creationsStore.collections.length > 0
      ) {
        // If the collections are already loaded
        if (collectionId) {
          const _selectedCollection = getCollectionByIdSelector(collectionId);
          setSelectedCollection(_selectedCollection);
        } else {
          setSelectedCollection(creationsStore.collections[0]);
        }
      } else {
        const spaceCollections: Collection[] =
          await appCreationsContract.getCollections(space.id);

        const formattedCollections: Collection[] = [];

        for (let i = 0; i < spaceCollections.length; i++) {
          const _id = BigNumber.from(spaceCollections[i].id).toNumber();

          formattedCollections.push({
            id: _id,
            name: spaceCollections[i].name,
            contractAddress: spaceCollections[i].contractAddress,
          });

          if (_id == collectionId) {
            setSelectedCollection(formattedCollections[i]);
            console.log("select", formattedCollections[i]);
          }
        }

        dispatch(setCollections(formattedCollections));
        if (!collectionId) {
          setSelectedCollection(formattedCollections[0]);
        }
      }
    };

    loadCollections();
  }, [
    appCreationsContract,
    collectionId,
    creationsStore.collections,
    creationsStore.spaceId,
    dispatch,
    getCollectionByIdSelector,
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

        if (!collectionContract) return;

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

  const routeToSelectedCollection = (
    collection: Collection,
    newCollection: boolean = false,
  ) => {
    setSelectedCollection(collection);
    const route = `/${query.handle}/creations?collectionId=${collection.id}`;

    if (newCollection) {
      router.push(`/${route}&newCollection=true`);
      return;
    }

    router.push(`${route}`);
  };

  const createCollection = async () => {
    if (
      !appCreationsContract ||
      !newCollectionInput.current ||
      newCollectionInput.current?.value.length < 3 ||
      membership?.isAdmin !== true ||
      membership.isActive !== true
    )
      return;

    try {
      const collectionName = newCollectionInput.current?.value;

      const symbol = collectionName.substring(0, 5).toUpperCase();

      appCreationsContract.on(
        "CollectionCreated",
        (spaceId, creator, newCollection) => {
          console.log("new collection", newCollection, spaceId, creator);

          console.log(BigNumber.from(spaceId).toNumber(), space.id);
          console.log(creator, accountAddress);

          if (
            BigNumber.from(spaceId).toNumber() == space.id &&
            creator == accountAddress &&
            getCollectionByIdSelector(
              BigNumber.from(newCollection.id).toNumber(),
            ) == null
          ) {
            const formattedNewCollection = {
              id: BigNumber.from(newCollection.id).toNumber(),
              name: newCollection.name,
              contractAddress: newCollection.contractAddress,
            };

            dispatch(
              setCollections([
                ...creationsStore.collections,
                formattedNewCollection,
              ]),
            );

            routeToSelectedCollection(formattedNewCollection, true);

            if (newCollectionInput.current) {
              newCollectionInput.current.disabled = false;
              newCollectionInput.current.value = "";
            }
            setCollectionCreating(false);
          }
        },
      );

      newCollectionInput.current.disabled = true;
      setCollectionCreating(true);

      const tx = await appCreationsContract.createCollection(
        space.id,
        collectionName,
        symbol,
      );
    } catch (e) {
      newCollectionInput.current.disabled = false;
      setCollectionCreating(false);
      console.log("error", e);
    }
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

  if (
    creationsStore.spaceId === space.id &&
    creationsStore.collections.length === 0
  ) {
    return (
      <div className="w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create your first collection
          </h3>
        </div>

        <div className="flex flex-col items-center mt-4">
          <div className="mt-1">
            <input
              type="text"
              name="collection"
              id="collection"
              ref={newCollectionInput}
              className="block w-72 rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm p-4"
              placeholder="collection name"
            />
          </div>
          <Button
            additionalClassName="p-1 mt-4"
            buttonProps={{
              onClick: () => {
                createCollection();
              },
              disabled: collectionCreating,
            }}
          >
            {collectionCreating ? "creating..." : "+ create"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row grow">
      <>
        <div className="relative hidden md:w-1/5 md:flex flex-col my-1 sm:m-4 max-h-[calc(100vh-400px)]">
          {creationsStore.spaceId === space.id &&
            creationsStore.collections.length > 0 && (
              <div className="border-b pb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900 sm:truncate mb-5">
                  Collections
                </h3>

                {creationsStore.collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={classNames({
                      "flex flex-row items-center justify-between p-2 rounded-lg cursor-pointer ":
                        true,
                      "bg-gray-100":
                        selectedCollection &&
                        collection.id === selectedCollection.id,
                    })}
                    onClick={() => routeToSelectedCollection(collection)}
                  >
                    <span>{collection.name}</span>
                  </div>
                ))}
              </div>
            )}

          {membership?.isAdmin === true && membership.isActive === true && (
            <div className="w-full mt-2 p2 pt-5">
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
                  disabled: collectionCreating,
                }}
              >
                {collectionCreating ? "creating..." : "+ new collection"}
              </Button>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col my-1 sm:mb-4 ">
          {creationsStore.spaceId === space.id &&
            creationsStore.collections.length > 0 &&
            membership?.isAdmin === true &&
            membership.isActive === true && (
              <div className="flex flex-row items-center justify-between p-2 mb-5">
                <Link href={`/${query.handle}/creations?view=form`}>
                  <Button additionalClassName="p-2">+ new creation</Button>
                </Link>
              </div>
            )}

          {creationsStore.spaceId === space.id && selectedCollection && (
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
                    0) && <></>}
              {/* TODO: Add a placehoolder image here */}
            </>
          )}
        </div>
      </>
    </div>
  );
}
