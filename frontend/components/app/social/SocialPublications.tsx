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
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Address, useAccount, useSignMessage, useSignTypedData } from "wagmi";
import { PageState } from ".";
import useLensContracts from "../../../hooks/lens/useLensContracts";
import useTimeout from "../../../hooks/useTimeout";
import { livepeerApiKey } from "../../../lib/envs";
import { getFileUri } from "../../../lib/web3storage/getIpfsJsonContent";
import { Publication } from "../../../types/lens-generated";
import Button from "../../Button";
import Notification from "../../Notification";
import Spinner from "../../Spinner";
import { saveToIpfsAndCreatePost } from "./post_utils";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function SocialPublications({
  socialDetails,
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
  const { signMessageAsync } = useSignMessage();
  const { lensHubContract } = useLensContracts();

  const [isLoading, setIsloading] = useState(false);
  const [success, setSuccess] = useState("");

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: livepeerApiKey,
    }),
  });

  const { signTypedDataAsync } = useSignTypedData({
    onError: (error) => {
      console.log(error);
    },
  });

  useTimeout(!!success, 8_000, () => setSuccess(""));

  const isLensPublisher =
    socialDetails?.lensWallet && address === socialDetails?.lensWallet;

  return (
    <LivepeerConfig client={livepeerClient}>
      <div className="flex justify-between">
        {isLensPublisher && defaultProfile?.id && (
          // TODO: Had to use button instead og Button component due to inability to override default styles
          <button
            className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
            onClick={() => setWritePost(!writePost)}
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
            onClick={() => setPageState({ type: PageState.Profile, data: "" })}
          >
            <Cog8ToothIcon width={24} />
          </button>
        )}
      </div>

      {success && (
        <Notification>
          <span className="block">Transaction successful!</span>
          <span className="block mt-4 text-sm">
            It might take quite some time to get the post metadata pinned.
            Please be patient a bit.
          </span>
          <div className="mt-4 flex">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://mumbai.polygonscan.com/tx/${success}`}
              >
                View on Polyscan
              </a>
            </button>
          </div>
        </Notification>
      )}

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
            onClick: () =>
              saveToIpfsAndCreatePost({
                post,
                setIsloading,
                defaultProfile,
                address,
                signMessageAsync,
                signTypedDataAsync,
                lensHubContract,
                setSuccess,
              }),
            disabled: !post.content || !isLensPublisher,
          }}
        >
          {isLoading ? <Spinner /> : "Publish"}
        </Button>
      )}

      <div className="flex justify-center mt-8">
        <div className="gap-4 w-1/2">
          {isLensPublisher && !socialDetails?.lensDefaultProfileId && (
            <h2 className="w-full text-center text-lg">
              No profile has been setup yet. Please navigate to settings page.
            </h2>
          )}

          {(publications?.items?.length === 0 ||
            (!isLensPublisher && !socialDetails?.lensDefaultProfileId)) && (
            <h2 className="w-full text-center text-lg">No posts exist...</h2>
          )}

          {publications?.items?.map((publication: Publication) => {
            return (
              <div
                key={publication.id}
                className=" rounded-lg border-gray-400 border-2 mt-2 p-4 mb-4 cursor-default shadow-xl"
              >
                <div className="flex items-center">
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

                  <p className="text-md font-bold ml-4">
                    {publication?.metadata?.name}
                  </p>
                </div>

                <div className="flex-1 ml-4 mt-4">
                  <div className="truncate text-sm text-gray-900 mb-2">
                    <ReactMarkdown>
                      {publication.metadata.content}
                    </ReactMarkdown>
                  </div>

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
