import { ThreeIdConnect } from "@3id/connect";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useContext, useState } from "react";
import { useAccount } from "wagmi";
import { authenticationWithCeramic } from "../../../hooks/useAuthenticateCeramic";
import { CeramicContext } from "../../../lib/CeramicContext";
import DiscussionTopicComment from "./TopicComment";
import { ceramicUri } from "../../../lib/envs";

// We get all the topics and then filter on the frontend as
// ComposeDB does not support filtering at this time
const DISCUSSION_TOPIC_COMMENT_QUERY = gql`
  query {
    discussionTopicCommentIndex(first: 100) {
      edges {
        node {
          id
          spaceId
          address
          content
        }
      }
    }
  }
`;

const DISCUSSION_TOPIC_COMMENT_MUTATION = gql`
  mutation CreateNewDiscussionTopicComment(
    $i: CreateDiscussionTopicCommentInput!
  ) {
    createDiscussionTopicComment(input: $i) {
      document {
        id
        discussionTopicId
        discussionTopic {
          id
          title
        }
        content
        address
        spaceId
      }
    }
  }
`;

export default function TopicComments() {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const [title, setTitle] = useState("New Topic default title");
  const [content, setContent] = useState("topic content");
  const account = useAccount();

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_COMMENT_QUERY, {
    onCompleted: (data) => {
      console.log("TopicComment", data);
    },
    onError: (error) => {
      console.log("error", error);
    },
    context: { clientName: "compose" },
  });

  const [discussionTopicCommentMutation] = useMutation(
    DISCUSSION_TOPIC_COMMENT_MUTATION,
    {
      onCompleted: (data) => {
        alert("saved comment");
      },
      onError: (error) => {
        console.log("error", error);
      },
    },
  );

  const createNewDiscussionTopicComment = async () => {
    // await useAuthenticateCeramic(threeId, composeDbClient);
    await authenticationWithCeramic(window.ethereum, threeId, composeDbClient);

    discussionTopicCommentMutation({
      variables: {
        i: {
          content: {
            discussionTopicId:
              "kjzl6kcym7w8ya26fgzodhklnsp5ivop1i3jevcz0nd5edzqhyhstnynjolw4wz",
            content: "I like this",
            address: "0x...Hdk",
            // spaceId,
          },
        },
      },
    });
  };

  return (
    <>
      {loading && <div>Loading...</div>}
      <button
        onClick={() => createNewDiscussionTopicComment()}
        className="rounded-full border-violet-600 border-2 bg-transparent py-4 px-12 text-violet-600 shadow-sm focus:outline-none focus:ring-none mb-7 font-semibold text-xl"
      >
        Create Comment
      </button>
      {error && (
        <div>
          Error connecting to remote Ceramic daemon on {ceramicUri}......
        </div>
      )}
      {data && (
        <div>
          <ul>
            {data.discussionTopicCommentIndex.edges
              // .filter((edge: any) => edge.node.spaceId === spaceId)
              .map((edge: any) => (
                <DiscussionTopicComment
                  key={edge.node.id}
                  id={edge.node.id}
                  spaceId={edge.node.spaceId}
                  address={edge.node.address}
                  content={edge.node.content}
                />
              ))}
          </ul>
        </div>
      )}
    </>
  );
}
