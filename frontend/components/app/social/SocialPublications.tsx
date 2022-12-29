import dynamic from "next/dynamic";
import React from "react";
import { useAccount } from "wagmi";
import { Publication } from "../../../types/lens-generated";
import Button from "../../Button";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function SocialPublications({
  isLensPublisher,
  setWritePost,
  writePost,
  PageState,
  setPageState,
  space,
  post,
  setPost,
  saveToIpfsAndCreatePost,
  publications,
}) {
  const { address } = useAccount();

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
              onClick: () => setPageState(PageState.Profile),
            }}
          >
            Manage Profile
          </Button>
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
        <h3>Posts</h3>

        <div className="mt-6">
          {publications?.items?.length === 0 && <div>No posts so far...</div>}

          {publications?.items?.map((item: Publication) => {
            return (
              <div
                key={item.id}
                className="rounded-lg border-gray-400 border-2 mt-2"
              >
                {item.metadata?.name} -{" "}
                {item?.createdAt && new Date(item.createdAt).toLocaleString()}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
