import DiscussionTopic from "../../components/app/discussion/DiscussionTopic";
import DiscussionTopicComment from "../../components/app/discussion/DiscussionTopicComment";
import AppLayout from "../../components/AppLayout";

export default function SpaceViewPage() {
  return (
    <>
      <AppLayout title="Get Space Name from Handle">
        <h1>Space View</h1>

        <DiscussionTopic />
        <DiscussionTopicComment />
      </AppLayout>
    </>
  );
}
