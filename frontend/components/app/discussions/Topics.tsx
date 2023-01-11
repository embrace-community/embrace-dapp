import { ThreeIdConnect } from "@3id/connect";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import TopicItem from "./TopicItem";

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
          createdAt
        }
      }
    }
  }
`;

export default function Topics({ spaceId, handle }) {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const account = useAccount();

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      console.log("discussionTopicIndex", data);
    },
    onError: (error) => {
      console.log("error", error);
    },
    context: { clientName: "compose" },
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>Error check daemon...</div>}

      {data && (
        <div className="flex justify-center mt-8">
          <div className="gap-4 w-full md:w-1/2">
            {data.discussionTopicIndex.edges
              .filter((edge: any) => edge.node.spaceId === spaceId)
              .map((edge: any) => (
                <TopicItem
                  key={edge.node.id}
                  includeContent={false}
                  handle={handle}
                  id={edge.node.id}
                  spaceId={edge.node.spaceId}
                  address={edge.node.address}
                  title={edge.node.title}
                  content={edge.node.content}
                  createdAt={edge.node.createdAt}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
