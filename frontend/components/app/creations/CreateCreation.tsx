import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import getWeb3StorageClient from "../../../lib/web3storage/client";
import Spinner from "../../Spinner";
import * as mime from "mime";
import classNames from "classnames";
import {
  createReactClient,
  LivepeerConfig,
  Player,
  studioProvider,
} from "@livepeer/react";
import { getFileUri } from "../../../lib/web3storage/getIpfsJsonContent";
import { FireIcon } from "@heroicons/react/24/outline";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { Collection, Creation } from "../../../types/space-apps";
import { BigNumber, ethers, Signer } from "ethers";
import { useSigner } from "wagmi";
import {
  addCollectionCreation,
  getCreationById,
} from "../../../store/slices/creations";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { RootState } from "../../../store/store";

const creationTypes = [
  { id: "video", title: "Video" },
  { id: "audio", title: "Audio", disabled: true },
  { id: "image", title: "Image", disabled: true },
  { id: "article", title: "Article", disabled: true },
];

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY,
  }),
});

type Preview = {
  name: string;
  description: string;
  thumbnail: string;
  creation: string;
};

export default function CreateCreation({
  id,
  selectedCollection,
  handle,
}: {
  id: number;
  selectedCollection: Collection;
  handle: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [creationCid, setCreationCid] = useState<string>("");
  const [creationMime, setCreationMime] = useState<string>("");
  const [isCreationLoading, setIsCreationLoading] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [metadataCid, setMetadataCid] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const previewTimeout = useRef<any>();
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const { appCreationCollectionsABI } = useAppContract();
  const { data: signer } = useSigner();
  const dispatch = useAppDispatch();
  const getCreationByIdSelector = useAppSelector(getCreationById);

  // Attempt to stop the preview from being created on every keystroke
  // TODO: Livepeer preview keeps loading when the user is typing - alot of network requests!!
  useEffect(() => {
    clearTimeout(previewTimeout.current);

    previewTimeout.current = setTimeout(() => {
      setPreview({
        name,
        description,
        thumbnail: getFileUri(imageCid),
        creation: `ipfs://${creationCid}`,
      });
    }, 500);
  }, [name, description, imageCid, creationCid]);

  // Called whenever the metadataCid is set
  useEffect(() => {
    async function mintCreation() {
      if (!metadataCid || !signer) return;

      console.log("mintCreation " + metadataCid);

      try {
        const collectionContractAddress = selectedCollection?.contractAddress;

        // Get the creations for this collection
        const collectionContract = new ethers.Contract(
          collectionContractAddress,
          appCreationCollectionsABI,
          signer as Signer,
        );

        if (!collectionContract) return;

        // Listening for the CreationCreated event
        collectionContract.on(
          "CreationCreated",
          (spaceId, creator, collectionAddress, creationId) => {
            const _creationId = BigNumber.from(creationId).toNumber();
            const newCreation: Creation = {
              tokenId: _creationId,
              tokenURI: metadataCid,
              owner: creator,
            };

            const creationExists = getCreationByIdSelector(
              selectedCollection.id,
              _creationId,
            );

            // Check that this is the creation we just minted and not a replay of an event
            // Seems to happen on localhost / hardhat
            if (!creationExists) {
              // Add creation to store
              dispatch(
                addCollectionCreation({
                  collectionId: selectedCollection.id,
                  creation: newCreation,
                }),
              );

              setIsMinting(false);

              // Redirect to creation page
              router.push(
                `/${handle}/creations?collectionId=${selectedCollection.id}&creationId=${_creationId}`,
              );
            }
          },
        );

        const tx = await collectionContract.mint(metadataCid);
        console.log("mintCreation tx" + tx.hash);
      } catch (error) {
        console.log("mintCreation error", error);
      }
    }

    mintCreation();

    // TODO: Issue as transaction is called again once the event is received
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataCid]);

  async function uploadThumbnail(e: ChangeEvent<HTMLInputElement>) {
    /* upload cover image to ipfs and save content to state */
    const uploadedFile = e?.target?.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsImageLoading(true);

      const uploadedCid = await getWeb3StorageClient().put([uploadedFile], {
        wrapWithDirectory: false,
      });
      console.log("Uploaded image to ipfs, CID: ", uploadedCid);

      setImage(uploadedFile);
      setImageCid(uploadedCid);
    } catch (err: any) {
      console.log("Error: ", err.message);
    } finally {
      setIsImageLoading(false);
    }
  }

  async function uploadCreation(e: ChangeEvent<HTMLInputElement>) {
    /* upload cover image to ipfs and save content to state */
    const uploadedFile = e?.target?.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsCreationLoading(true);

      const uploadedCid = await getWeb3StorageClient().put([uploadedFile], {
        wrapWithDirectory: false,
      });
      console.log("Uploaded creation to ipfs, CID: ", uploadedCid);
      setCreationCid(uploadedCid);

      const _mime = mime.getType(uploadedFile.name);
      setCreationMime(_mime);
    } catch (err: any) {
      console.log("Error: ", err.message);
    } finally {
      setIsCreationLoading(false);
    }
  }

  const sendMetadataToIpfs = async () => {
    setIsMinting(true);

    const creationMetadata = {
      name,
      description,
      animation_url: `ipfs://${creationCid}`,
      external_url: `https://embrace.community/creations/`, // Needs proper link to embrace site
      image: `ipfs://${imageCid}`,
      attributes: {
        tags: [type],
        type,
        mediaType: creationMime,
      },
    };

    try {
      const cid = (await saveToIpfs(
        creationMetadata,
        `${creationMetadata.name.replaceAll(" ", "_")}.json`,
      )) as string;

      if (cid) {
        console.log("Uploaded json to ipfs, CID: ", cid);
        // useEffect will trigger createSpace once CID is set
        setMetadataCid(cid);
        return;
      }

      setIsMinting(false);

      console.error("Failed to save post to IPFS");
    } catch (err: any) {
      console.error(`Failed to save post to IPFS, ${err.message}`);
      setIsMinting(false);
    }
  };

  return (
    <>
      <div className="w-full  mb-6 flex flex-row align-middle">
        <Link
          className="text-sm text-embracedark text-opacity-70 mt-2 ml-10 underline"
          href="/"
          onClick={() => router.back()}
        >
          cancel
        </Link>
      </div>

      <div className="w-full flex flex-row grow">
        <div className="w-full flex flex-col ml-10 p-4">
          {(isImageLoading || isCreationLoading) && <Spinner />}

          <div className="w-full md:w-3/4">
            <div className="mb-7">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-embracedark"
              >
                Type
              </label>

              <div className="space-y-4 m-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {creationTypes.map((creationType) => (
                  <div key={creationType.id} className="flex items-center">
                    <input
                      id={creationType.id}
                      name="notification-method"
                      type="radio"
                      disabled={creationType.disabled}
                      className={classNames({
                        "h-4 w-4 border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer":
                          true,
                        "opacity-50": creationType.disabled,
                      })}
                      value={creationType.id}
                      onChange={(e) => setType(creationType.id)}
                    />
                    <label
                      htmlFor={creationType.id}
                      className={classNames({
                        "ml-3 block text-sm font-medium text-embracedark cursor-pointer":
                          true,
                        "opacity-50": creationType.disabled,
                      })}
                    >
                      {creationType.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-embracedark"
              >
                Creation
              </label>

              <div className="mt-2">
                <input
                  type="file"
                  accept="video/*"
                  className="text-sm text-violet-600
                file: file:py-1 file:px-6
                file:rounded-full file:border-2
                file:border-violet-600
                file:text-sm file:font-medium
                file:bg-transparent file:text-violet-600"
                  onChange={(e) => uploadCreation(e)}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-embracedark"
              >
                Thumbnail
              </label>

              {image && (
                <Image
                  className="w-48 h-48 rounded-lg my-5"
                  src={URL.createObjectURL(image)}
                  alt="image to upload"
                  width={192}
                  height={192}
                />
              )}

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-violet-600
                file: file:py-1 file:px-6
                file:rounded-full file:border-2
                file:border-violet-600
                file:text-sm file:font-medium
                file:bg-transparent file:text-violet-600"
                  onChange={(e) => uploadThumbnail(e)}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-embracedark"
              >
                Name
              </label>

              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block bg-transparent text-embracedark w-full rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                  placeholder="The name of your new space"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-embracedark"
              >
                Description
              </label>

              <div className="mt-2">
                <textarea
                  name="description"
                  id="description"
                  className="block bg-transparent w-full resize-none text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                  placeholder="Description of new space"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />
              </div>

              <button
                className="inline-flex items-center rounded-full border-violet-600 border-2 bg-transparent py-2 px-10 text-violet-600 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30 mt-4"
                disabled={
                  !name ||
                  !description ||
                  !type ||
                  !imageCid ||
                  !creationCid ||
                  isMinting
                }
                onClick={() => {
                  sendMetadataToIpfs();
                }}
              >
                {isMinting ? (
                  <Spinner widthHeight={6} />
                ) : (
                  <>
                    mint creation <FireIcon className="w-6 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full hidden md:flex flex-col align-middle">
          {imageCid && creationCid && type === "video" && (
            <LivepeerConfig client={livepeerClient}>
              <h1 className="text-xl font-medium leading-6 text-gray-900 sm:truncate mb-5">
                Preview
              </h1>

              <Player
                title={name}
                src={preview?.creation}
                autoPlay={false}
                objectFit="contain"
                poster={preview?.thumbnail}
                muted={false}
                autoUrlUpload={{
                  fallback: true,
                  ipfsGateway: "https://cloudflare-ipfs.com",
                }}
              />
              <div className="w-full flex justify-left p-2">
                {<h1 className="text-2xl font-bold">{preview?.name}</h1>}
              </div>

              <div className="w-full flex justify-left p-2">
                {<p className="text-sm">{preview?.description}</p>}
              </div>
            </LivepeerConfig>
          )}
        </div>
      </div>
    </>
  );
}
