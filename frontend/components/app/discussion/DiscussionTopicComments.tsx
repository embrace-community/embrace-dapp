import { gql, useQuery } from "@apollo/client";
import { useContext, useState } from "react";
import { SpaceContext } from "../../../lib/SpaceContext";
import DiscussionTopicComment from "./DiscussionTopicComment";

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

export default function DiscussionTopicComments() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_COMMENT_QUERY, {
    onCompleted: (data) => {
      console.log("DiscussionTopicComment", data);
    },
    onError: (error) => {
      console.log("error", error);
    },
  });
  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {data && (
        <div>
          <ul>
            {data.discussionTopicCommentIndex.edges
              .filter((edge: any) => edge.node.spaceId === spaceId)
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
