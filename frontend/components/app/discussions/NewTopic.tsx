import { ThreeIdConnect } from "@3id/connect";
import { gql, useMutation } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import DiscussionTopic from "./TopicItem";
import { authenticationWithCeramic } from "../../../hooks/useAuthenticateCeramic";
import Button from "../../Button";

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

export default function NewTopic() {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const [title, setTitle] = useState("Let's discuss our next steps");
  const [content, setContent] = useState("_Markdown content here_");
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
    try {
      await authenticationWithCeramic(
        window.ethereum,
        threeId,
        composeDbClient,
      );

      discussionTopicMutation({
        variables: {
          i: {
            content: {
              title,
              content,
              address: account.address,
              // spaceId,
            },
          },
        },
      });
    } catch (e: any) {
      console.error(`Error ${e.message}`);
    }
  };

  return (
    <>
      <Button
        buttonProps={{
          onClick: () => {
            createNewDiscussionTopic();
          },
        }}
      >
        Create Topic
      </Button>
    </>
  );
}
