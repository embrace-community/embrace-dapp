export default function DiscussionTopicComment({
  id,
  spaceId,
  address,
  content,
}) {
  return (
    <>
      <div>
        <span>Comment</span>
        <span>{id}</span>
        <span>{spaceId}</span>
        <span>{address}</span>
        <span>{content}</span>
      </div>
    </>
  );
}
