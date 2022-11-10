import { Router } from "next/router";
import { useEffect, useState } from "react";
import { EmbraceSpace } from "../../../utils/types";
import Topics from "./Topics";

export default function Discussions({
  query,
  space,
}: {
  query: Router["query"];
  space: EmbraceSpace;
}) {
  const [topicId, setTopicId] = useState<number>(0);
  const [newTopic, setNewTopic] = useState<boolean>(false);

  // Set the topicId if set in the router query
  useEffect(() => {
    if (query.id) {
      setTopicId(parseInt(query.id as string));
    }
  }, []);

  return (
    <>
      {!topicId && (
        <button
          className="
                        rounded-full
                        border-violet-500
                        border-2
                        bg-transparent
                        py-4
                        px-12
                        text-violet-500
                        shadow-sm
                        focus:outline-none
                        focus:ring-none
                        mb-7
                        font-semibold
                        text-xl"
          onClick={(e) => setNewTopic(true)}
        >
          + new topic
        </button>
      )}

      {newTopic && <>New Topic</>}

      {topicId && <>Topic ID = {topicId}</>}

      {!topicId && <Topics spaceId={space.index} />}
    </>
  );
}
