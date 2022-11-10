import { ThreeIdConnect } from "@3id/connect";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import { SpaceContext } from "../../../lib/SpaceContext";
import DiscussionTopic from "./DiscussionTopic";
import { useAuthenticateCeramic } from "../../../hooks/useAuthenticateCeramic";

// We get all the topics and then filter on the frontend as
// ComposeDB does not support filtering at this time
const DISCUSSION_TOPIC_QUERY = gql`
  query {
    discussionTopicIndex(first: 100) {
      edges {
        node {
          id
          spaceId
          title
          address
          content
        }
      }
    }
  }
`;

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

export default function DiscussionTopics() {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const [title, setTitle] = useState("New Topic default title");
  const [content, setContent] = useState("topic content");
  const { account } = useAccount();

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      console.log(data, "dis");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const [discussionTopicMutation] = useMutation(DISCUSSION_TOPIC_MUTATION, {
    onCompleted: (data) => {
      alert("saved discussion topic");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const createNewDiscussionTopic = async () => {
    await useAuthenticateCeramic(threeId, composeDbClient);

    discussionTopicMutation({
      variables: {
        i: {
          content: {
            title,
            content,
            address: account.address,
            spaceId,
          },
        },
      },
    });
  };

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>Error check daemon...</div>}
      <button
        onClick={() => createNewDiscussionTopic()}
        className="
                        rounded-full
                        border-violet-500
                        border-2
                        bg-transparent
                        py-4
                        px-12
                        text-violet-500
                        shadow-sm
                        focus:outline-none
                        focus:ring-none
                        mb-7
                        font-semibold
                        text-xl"
      >
        Create Discussion
      </button>
      {data && (
        <div>
          <ul>
            {data.discussionTopicIndex.edges
              .filter((edge: any) => edge.node.spaceId === spaceId)
              .map((edge: any) => (
                <DiscussionTopic
                  key={edge.node.id}
                  id={edge.node.id}
                  spaceId={edge.node.spaceId}
                  address={edge.node.address}
                  title={edge.node.title}
                  content={edge.node.content}
                />
              ))}
          </ul>
        </div>
      )}
    </>
  );
}
