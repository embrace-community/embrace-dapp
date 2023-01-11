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
import Topics from "./Topics";
import TopicView from "./TopicView";
import Button from "../../Button";
import Modal from "../../Modal";
import dynamic from "next/dynamic";
import { useContext, useState } from "react";
import { ThreeIdConnect } from "@3id/connect";
import { CeramicContext } from "../../../lib/CeramicContext";
import { gql, useMutation } from "@apollo/client";
import { authenticationWithCeramic } from "../../../hooks/useAuthenticateCeramic";
import { useAccount } from "wagmi";

const DISCUSSION_TOPIC_MUTATION = gql`
  mutation CreateNewDiscussionTopic($i: CreateDiscussionTopicInput!) {
    createDiscussionTopic(input: $i) {
      document {
        id
        title
        content
        address
        spaceId
      }
    }
  }
`;

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
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);
  const account = useAccount();
  // const spaceId = space.id;
  const spaceId = 998;

  const [writeTopic, setWriteTopic] = useState(false);
  const [topic, setTopic] = useState(topicInitialState);
  const [isLoading, setIsLoading] = useState(false);

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: livepeerApiKey,
    }),
  });

  const [discussionTopicMutation] = useMutation(DISCUSSION_TOPIC_MUTATION, {
    onCompleted: (data) => {
      alert("saved discussion topic");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  if (topicId)
    return (
      <>
        <LivepeerConfig client={livepeerClient}>
          <div className="w-full">
            <TopicView
              spaceId={spaceId}
              topicId={topicId}
              handle={space.handle}
            />
          </div>
        </LivepeerConfig>
      </>
    );

  const createNewDiscussionTopic = async () => {
    try {
      setIsLoading(true);
      await authenticationWithCeramic(
        window.ethereum,
        threeId,
        composeDbClient,
      );

      console.log("createNewDiscussionTopic", {
        title: topic.title,
        content: topic.content,
        address: account.address,
        spaceId,
      });

      discussionTopicMutation({
        variables: {
          i: {
            content: {
              title: topic.title,
              content: topic.content,
              address: account.address,
              spaceId,
            },
          },
        },
      });
    } catch (e: any) {
      console.error(`Error ${e.message}`);
    }

    setIsLoading(false);
  };

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
                // setWriteTopic(false);
                createNewDiscussionTopic();
              },
            }}
          >
            {isLoading ? <Spinner /> : "Post"}
          </Button>
        }
      ></Modal>

      <LivepeerConfig client={livepeerClient}>
        {/* <Topics spaceId={space.id} handle={space.handle} /> */}
        <Topics spaceId={spaceId} handle={space.handle} />
      </LivepeerConfig>
    </div>
  );
}
