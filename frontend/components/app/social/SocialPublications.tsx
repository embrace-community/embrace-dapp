import dynamic from "next/dynamic";
import { useState } from "react";
import { uuid } from "uuidv4";
import { Address, useAccount, useSignMessage } from "wagmi";
import { PageState } from ".";
import { createPost } from "../../../api/lens/createPost";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import {
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
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsloading] = useState(false);

  async function saveToIpfsAndCreatePost() {
    if (!post.title || !post.content || !post.coverImage) {
      return;
    }

    let ipfsResult: string;

    try {
      setIsloading(true);

      ipfsResult = (await saveToIpfs(
        {
          version: "2.0.0",
          mainContentFocus: PublicationMainFocus.TextOnly,
          metadata_id: uuid(),
          description: "Description",
          locale: "en-US",
          content: "Content",
          external_url: null,
          image: null,
          imageMimeType: null,
          name: "Name",
          attributes: [],
          tags: ["using_api_examples"],
          appId: "api_examples_github",
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
      const createPostRequest = {
        profileId: defaultProfile?.id,
        contentURI: `ipfs://${ipfsResult}`,
        collectModule: {
          // feeCollectModule: {
          //   amount: {
          //     currency: currencies.enabledModuleCurrencies.map(
          //       (c: any) => c.address
          //     )[0],
          //     value: '0.000001',
          //   },
          //   recipient: address,
          //   referralFee: 10.5,
          // },
          // revertCollectModule: true,
          freeCollectModule: { followerOnly: true },
          // limitedFeeCollectModule: {
          //   amount: {
          //     currency: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
          //     value: '2',
          //   },
          //   collectLimit: '20000',
          //   recipient: '0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3',
          //   referralFee: 0,
          // },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      };

      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

      createPost(createPostRequest);
    } catch (err: any) {
      console.error(`An error occurred creating the post on lens`);
    } finally {
      setIsloading(false);
    }
  }

  return (
    <>
      <div className="flex justify-between">
        {isLensPublisher && (
          <Button
            additionalClassName="p-2"
            buttonProps={{
              onClick: () => {
                setWritePost((prevState) => !prevState);
              },
            }}
          >
            {writePost ? "Hide Post" : "Write Post"}
          </Button>
        )}

        {(isLensPublisher || address === space.founder) && (
          <Button
            additionalClassName="p-2 ml-auto"
            buttonProps={{
              onClick: () =>
                setPageState({ type: PageState.Profile, data: "" }),
            }}
          ></Button>
        )}
      </div>

      {isLensPublisher && writePost && (
        <div className="mt-4">
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            placeholder="Post title"
            className="my-3 w-full rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
          />

          <input
            type="text"
            value={post.coverImage}
            onChange={(e) => setPost({ ...post, coverImage: e.target.value })}
            placeholder="Post cover image"
            className="mt-2 mb-5 w-full rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
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

      <div className="mt-8">
        <div className="mt-6 mx-auto max-w-xl">
          {publications?.items?.length === 0 && <div>No posts so far...</div>}

          {publications?.items?.map((item: Publication) => {
            return (
              <div
                key={item.id}
                className="flex justify-between rounded-lg border-gray-400 border-2 mt-2 p-4 cursor-pointer shadow-xl"
                onClick={() =>
                  setPageState({
                    type: PageState.PublicationDetail,
                    data: item.id,
                  })
                }
              >
                <span>{item.metadata?.name}</span>
                <span>
                  {item?.createdAt && new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
