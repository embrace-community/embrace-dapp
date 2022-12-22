import { Router } from "next/router";
import { useEffect, useState } from "react";
import { Space } from "../../../types/space";
import Topics from "./Topics";

export default function Discussions({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const [topicId, setTopicId] = useState<number>();
  const [newTopic, setNewTopic] = useState<boolean>(false);

  // Set the topicId if set in the router query
  useEffect(() => {
    if (query.id) {
      setTopicId(parseInt(query.id as string));
    }
  }, [query.id]);

  return (
    <div className="flex flex-col w-full justify-start items-start">
      {!topicId && (
        <button
          className="rounded-full border-violet-600 border-2 bg-transparent py-4 px-12 text-violet-600 shadow-sm focus:outline-none focus:ring-none mb-7 font-semibold text-xl"
          onClick={(e) => setNewTopic(true)}
        >
          + new topic
        </button>
      )}

      {newTopic && <>New Topic</>}

      {topicId && <>Topic ID = {topicId}</>}

      {!topicId && <Topics spaceId={space.id} />}
    </div>
  );
}
