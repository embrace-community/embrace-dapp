import { ThreeIdConnect } from "@3id/connect";
import { gql, useMutation } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import { SpaceContext } from "../../../lib/SpaceContext";
import DiscussionTopic from "./TopicItem";
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

export default function Topics() {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const [title, setTitle] = useState("New Topic default title");
  const [content, setContent] = useState("topic content");
  const account = useAccount();

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

  return <></>;
}
