import DiscussionTopics from "../../components/app/discussion/DiscussionTopics";
import DiscussionTopicComments from "../../components/app/discussion/DiscussionTopicComments";
import AppLayout from "../../components/AppLayout";
import { useRouter } from "next/router";
import { useContext } from "react";
import { SpaceContext } from "../../lib/SpaceContext";

export default function SpaceViewPage() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const handle = useRouter().query.handle;

  // use handle to get spaceId from contract
  const spaceIdFromHandle = 99999;
  console.log(spaceId, setSpaceId);

  return (
    <>
      <AppLayout title="Get Space Name from Handle">
        <h1>Space View # {spaceId}</h1>

        <DiscussionTopics />
        <DiscussionTopicComments />
      </AppLayout>
    </>
  );
}
