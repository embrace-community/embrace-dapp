import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

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

export default function DiscussionTopic() {
  const [discussionTopics, setDiscussionTopics] = useState([]);
  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      console.log("DiscussionTopic", data);
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  return <>
  {loading ? (

  ) : (
  <>{discussionTopics.toString()}</>
  )
  </>;
}
