import { ThreeIdConnect } from "@3id/connect";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { useContext, useState } from "react";
import { CeramicContext } from "../../../lib/CeramicContext";
import TopicItem from "./TopicItem";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ceramicUri } from "../../../lib/envs";

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

export default function TopicView({ spaceId, topicId, handle }) {
  const threeId = new ThreeIdConnect();
  const composeDbClient = useContext(CeramicContext);
  const [currentTopic, setCurrentTopic] = useState<any>(null);

  const account = useAccount();

  const { data, loading, error } = useQuery(DISCUSSION_TOPIC_QUERY, {
    onCompleted: (data) => {
      const topic = data.discussionTopicIndex.edges.find(
        (edge: any) =>
          edge.node.spaceId === spaceId && edge.node.id === topicId,
      );

      setCurrentTopic(topic);
    },
    onError: (error) => {
      console.log("error", error);
    },
    context: { clientName: "compose" },
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && (
        <div>
          Error connecting to remote Ceramic daemon on {ceramicUri}... on{" "}
          {ceramicUri}...
        </div>
      )}

      {data && (
        <>
          <Link href={`/${handle}/discussions`}>
            <button className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center">
              <ArrowUturnLeftIcon width={24} />
            </button>
          </Link>
          <div className="flex justify-center mt-8">
            <div className="gap-4 w-full md:w-1/2">
              {currentTopic && (
                <TopicItem
                  key={currentTopic.node.id}
                  id={currentTopic.node.id}
                  handle={handle}
                  includeContent={true}
                  spaceId={currentTopic.node.spaceId}
                  address={currentTopic.node.address}
                  title={currentTopic.node.title}
                  content={currentTopic.node.content}
                  createdAt={currentTopic.node.createdAt}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
