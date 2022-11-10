import { Router } from "next/router";
import { EmbraceSpace } from "../../../utils/types";
import DiscussionTopicComments from "./TopicComments";
import DiscussionTopics from "./Topics";

const jimmysdummies = [
  {
    id: 1,
    title: "Sed suscipit, nulla id tempus dapibus?",
    descr:
      "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
    poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
  },
  {
    id: 2,
    title: "Sed suscipit, nulla id tempus dapibus?",
    descr:
      "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
    poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
  },
  {
    id: 3,
    title: "Sed suscipit, nulla id tempus dapibus?",
    descr:
      "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
    poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
  },
  {
    id: 4,
    title: "Sed suscipit, nulla id tempus dapibus?",
    descr:
      "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
    poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
  },
];

export default function Discussions({
  query,
  space,
}: {
  query: Router["query"];
  space: EmbraceSpace;
}) {
  console.log("discussions index.tsx", query, space);
  const topicId = query.id;

  return (
    <>
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
      >
        + new topic
      </button>
      {topicId && <>Topic ID = {topicId}</>}
      {jimmysdummies.map((topic) => {
        return (
          <div
            className="w-full border-b-2 border-embracedark border-opacity-5 pb-7 mt-5 text-embracedark"
            key={topic.id}
          >
            <h2 className="text-xl font-semibold">{topic.title}</h2>
            <p className="text-sm font-normal mt-1">{topic.descr}</p>
          </div>
        );
      })}
      {/* <DiscussionTopics />
      <DiscussionTopicComments /> */}
    </>
  );
}
