import {
  Cog8ToothIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createReactClient,
  LivepeerConfig,
  Player,
  studioProvider,
} from "@livepeer/react";
import { format } from "date-fns";
import { TypedDataDomain } from "ethers";
import { splitSignature } from "ethers/lib/utils.js";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { v4 as uuidv4 } from "uuid";
import {
  Address,
  useAccount,
  useContractWrite,
  useSignMessage,
  useSignTypedData,
} from "wagmi";
import { PageState } from ".";
import { createPost } from "../../../api/lens/createPost";
import LensHubJsonAbi from "../../../data/abis/lens/lens-hub-contract-abi.json"; // TODO: IS THIS CORRECT ABI?
import useLensContracts from "../../../hooks/lens/useLensContracts";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { lensHubContractAddress, livepeerApiKey } from "../../../lib/envs";
import { getFileUri } from "../../../lib/web3storage/getIpfsJsonContent";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import {
  CreatePublicPostRequest,
  Publication,
  PublicationMainFocus,
} from "../../../types/lens-generated";
import Button from "../../Button";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function SocialPublications({
  isLensPublisher,
  setWritePost,
  writePost,
  setPageState,
  space,
  post,
  setPost,
  publications,
  defaultProfile,
}) {
  const { address } = useAccount();
  const [isLoading, setIsloading] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const { lensHubContract } = useLensContracts();

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: livepeerApiKey,
    }),
  });

  const { signTypedDataAsync, isLoading: typedDataLoading } = useSignTypedData({
    onError: (error) => {
      console.log(error);
    },
  });

  const { error, write } = useContractWrite({
    address: lensHubContractAddress,
    abi: LensHubJsonAbi, //LensHubProxy,
    functionName: "postWithSig",
    mode: "recklesslyUnprepared",
    onSuccess: ({ hash }) => {
      alert(`Success! Your post is being published. ${hash}`);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const omit = (object: Record<string, any>, name: string) => {
    delete object[name];
    return object;
  };

  function getSignature(typedData: {
    domain: TypedDataDomain;
    types: Record<string, any>;
    value: Record<string, any>;
  }) {
    console.log("create post: typedData", typedData);

    const formattedTypedData = {
      domain: omit(typedData.domain, "__typename"),
      // types: { PostWithSig: mappedTypes },
      types: omit(typedData.types, "__typename"),
      value: omit(typedData.value, "__typename"),
    };
    console.log("create post: getSignature", formattedTypedData);
    return formattedTypedData;
  }

  const typedDataGenerator = async (generatedData: any) => {
    const formattedTypedData = getSignature(generatedData.typedData);
    const signature = await signTypedDataAsync(formattedTypedData);

    const { v, r, s } = splitSignature(signature);

    const tx = await lensHubContract!.postWithSig({
      profileId: formattedTypedData.value.profileId,
      contentURI: formattedTypedData.value.contentURI,
      collectModule: formattedTypedData.value.collectModule,
      collectModuleInitData: formattedTypedData.value.collectModuleInitData,
      referenceModule: formattedTypedData.value.referenceModule,
      referenceModuleInitData: formattedTypedData.value.referenceModuleInitData,
      sig: { v, r, s, deadline: formattedTypedData.value.deadline },
    });

    await tx.wait();
    console.log("successfully created post: tx hash", tx.hash);
  };

  // Lens post example: https://github.com/lens-protocol/api-examples/blob/master/src/publications/post.ts
  async function saveToIpfsAndCreatePost() {
    if (!post.title || !post.content) {
      return;
    }

    let ipfsResult: string;

    try {
      setIsloading(true);

      ipfsResult = (await saveToIpfs(
        {
          version: "2.0.0",
          mainContentFocus: PublicationMainFocus.TextOnly,
          metadata_id: uuidv4(),
          description: "Created on Embrace Community",
          locale: "en-US",
          content: post.content,
          external_url: null,
          image: null,
          imageMimeType: null,
          name: post.title,
          attributes: [],
          tags: [],
          appId: "embrace_community",
        },
        post.title,
      )) as string;

      console.log("create post: ipfs result", ipfsResult);
    } catch (err: any) {
      setIsloading(false);
      console.error(
        `An error occurred saving post data to IPFS, ${err.message}`,
      );
      return;
    }

    try {
      // hard coded to make the code example clear
      const createPostRequest: CreatePublicPostRequest = {
        profileId: defaultProfile?.id,
        contentURI: `ipfs://${ipfsResult}`,
        collectModule: {
          freeCollectModule: { followerOnly: true },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      };

      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

      const result = await createPost(createPostRequest);

      await typedDataGenerator(result);
    } catch (err: any) {
      console.error(`An error occurred creating the post on lens`, err);
    } finally {
      setIsloading(false);
    }
  }

  return (
    <LivepeerConfig client={livepeerClient}>
      <div className="flex justify-between">
        {isLensPublisher && defaultProfile?.id && (
          // TODO: Had to use button instead og Button component due to inability to override default styles
          <button
            className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
            onClick={() => {
              setWritePost(!writePost);
            }}
          >
            {writePost ? (
              <XMarkIcon width={24} />
            ) : (
              <PencilSquareIcon width={24} />
            )}
          </button>
        )}

        {(isLensPublisher || address === space.founder) && (
          // TODO: Had to use button instead og Button component due to inability to override default styles
          <button
            className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
            onClick={() => {
              setPageState({ type: PageState.Profile, data: "" });
            }}
          >
            <Cog8ToothIcon width={24} />
          </button>
        )}
      </div>

      {isLensPublisher && writePost && (
        <div className="mt-4">
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            placeholder="Post title"
            className="my-3 w-full rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
          />

          <SimpleMDE
            placeholder="What's on your mind?"
            value={post.content}
            onChange={(value: string) => setPost({ ...post, content: value })}
          />
        </div>
      )}

      {isLensPublisher && writePost && (
        <Button
          additionalClassName="p-2 float-right"
          buttonProps={{
            onClick: saveToIpfsAndCreatePost,
            disabled: !post.content || !isLensPublisher,
          }}
        >
          Publish
        </Button>
      )}

      <div className="flex justify-center mt-8">
        <div className="gap-4 w-1/2">
          {publications?.items?.length === 0 && (
            <h1 className="w-full text-center text-lg">No posts exist...</h1>
          )}

          {publications?.items?.map((publication: Publication) => {
            return (
              <div
                key={publication.id}
                className=" rounded-lg border-gray-400 border-2 mt-2 p-4 mb-4 cursor-default shadow-xl"
              >
                <div className="flex">
                  <Image
                    className="h-10 w-10 rounded-full"
                    src={space.loadedMetadata?.image}
                    alt="Lens Profile Avatar"
                    width={40}
                    height={40}
                  />

                  <p className="text-xs font-medium text-gray-500 m-2 ml-4">
                    {publication?.createdAt &&
                      format(new Date(publication.createdAt), "MMM d")}
                  </p>
                </div>
                <div className="flex-1 ml-4 mt-4">
                  <p className="truncate text-sm text-gray-900 mb-2">
                    <ReactMarkdown>
                      {publication.metadata.content}
                    </ReactMarkdown>
                  </p>
                  {publication?.metadata?.media?.map((media, index) => {
                    return media?.original?.mimeType?.startsWith("image") ? (
                      <div className="rounded-lg mb-2">
                        <Image
                          key={`media${index}`}
                          src={getFileUri(
                            media?.original?.url.replaceAll("ipfs://", ""),
                          )}
                          className="rounded-lg w-1/3 h-auto"
                          alt="publication media"
                          width={0}
                          height={0}
                          sizes="100vw"
                        />
                      </div>
                    ) : media?.original?.mimeType?.startsWith("video") ? (
                      <div className="h-[450px] rounded-lg mb-2">
                        <Player
                          key={`media${index}`}
                          src={media?.original?.url}
                          // title={name}
                          autoPlay={false}
                          objectFit="contain"
                          muted={false}
                          autoUrlUpload={{
                            fallback: true,
                            ipfsGateway: "https://cloudflare-ipfs.com",
                          }}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LivepeerConfig>
  );
}
