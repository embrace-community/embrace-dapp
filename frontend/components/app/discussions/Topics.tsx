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
        }
      }
    }
  }
`;

export default function Topics({ spaceId }) {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);

  const account = useAccount();

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      data = data.discussionTopicIndex.edges.filter(
        (edge: any) => edge.node.spaceId === spaceId,
      );
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
        <div>
          <ul>
            {data.discussionTopicIndex.edges
              // .filter((edge: any) => edge.node.spaceId === spaceId)
              .map((edge: any) => (
                <TopicItem
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
