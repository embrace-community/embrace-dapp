import { ThreeIdConnect } from "@3id/connect";
import { gql, useMutation } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import { authenticationWithCeramic } from "../../../hooks/useAuthenticateCeramic";
import Button from "../../Button";

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

export default function NewTopic({ spaceId }) {
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

      console.log("createNewDiscussionTopic", {
        title,
        content,
        address: account.address,
        spaceId: 99999,
      });

      discussionTopicMutation({
        variables: {
          i: {
            content: {
              title,
              content,
              address: account.address,
              spaceId: 99999,
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
      <button
        className="inline-flex items-center rounded-full border-violet-600 border-2 bg-transparent py-2 px-10 text-violet-600 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30 mt-4"
        onClick={() => {
          createNewDiscussionTopic();
        }}
      >
        hello
      </button>
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
