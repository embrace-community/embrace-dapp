import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

// We get all the topics and then filter on the frontend as
// ComposeDB does not support filtering at this time
const DISCUSSION_TOPIC_COMMENT_QUERY = gql`
  query {
    discussionTopicIndex(first: 100) {
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

export default function DiscussionTopicComment() {
  const [discussionTopics, setDiscussionTopics] = useState([]);
  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_COMMENT_QUERY, {
    onCompleted: (data) => {
      setDiscussionTopics(data.discussionTopicIndex.edges);
      console.log("DiscussionTopicComment", data.discussionTopicIndex.edges);
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  return <>{discussionTopics.toString()}</>;
}
