import { PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";
import { Router } from "next/router";
import { livepeerApiKey } from "../../../lib/envs";
import { Space } from "../../../types/space";
import Spinner from "../../Spinner";
import NewTopic from "./NewTopic";
import Topics from "./Topics";
import TopicView from "./TopicView";
import Button from "../../Button";
import Modal from "../../Modal";
import dynamic from "next/dynamic";
import { useState } from "react";

const topicInitialState = { title: "", content: "" };

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function Discussions({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const topicId = query.id as string;

  const [writeTopic, setWriteTopic] = useState(false);
  const [topic, setTopic] = useState(topicInitialState);
  const [isLoading, setIsloading] = useState(false);

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: livepeerApiKey,
    }),
  });

  // if (topicId === "new")
  //   return (
  //     <>
  //       New Topic
  //       {/* <NewTopic spaceId={space.id} /> */}
  //       <NewTopic spaceId={999} />
  //     </>
  //   );

  if (topicId)
    return (
      <>
        <LivepeerConfig client={livepeerClient}>
          <div className="w-full">
            <TopicView spaceId={998} topicId={topicId} handle={space.handle} />
          </div>
        </LivepeerConfig>
      </>
    );

  return (
    <div className="w-full">
      <button
        className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
        onClick={() => setWriteTopic(!writeTopic)}
      >
        <PencilSquareIcon width={24} />
      </button>

      <Modal
        showModal={writeTopic}
        setShowModal={setWriteTopic}
        title={<div>Create Topic</div>}
        body={
          <div>
            <input
              type="text"
              value={topic.title}
              onChange={(e) => setTopic({ ...topic, title: e.target.value })}
              placeholder="Topic title"
              className="my-3 w-full rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
            />

            <SimpleMDE
              placeholder="What's on your mind?"
              value={topic.content}
              onChange={(value: string) =>
                setTopic({ ...topic, content: value })
              }
            />
          </div>
        }
        footer={
          <Button
            additionalClassName="p-2 float-right"
            buttonProps={{
              onClick: async () => {
                setWriteTopic(false);
              },
            }}
          >
            {isLoading ? <Spinner /> : "Post"}
          </Button>
        }
      ></Modal>

      <LivepeerConfig client={livepeerClient}>
        {/* <Topics spaceId={space.id} handle={space.handle} /> */}
        <Topics spaceId={998} handle={space.handle} />
      </LivepeerConfig>
    </div>
  );
}
