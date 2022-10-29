import { gql, useQuery } from "@apollo/client";
import { useContext, useState } from "react";
import { SpaceContext } from "../../../lib/SpaceContext";
import DiscussionTopic from "./DiscussionTopic";

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

export default function DiscussionTopics() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      console.log(data, "dis");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>Error check daemon...</div>}
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
