export default function DiscussionTopic({
  id,
  spaceId,
  address,
  title,
  content,
}) {
  return (
    <>
      <div>
        <span>Topic</span>
        <span>{id}</span>
        <span>{spaceId}</span>
        <span>{address}</span>
        <span>{title}</span>
        <span>{content}</span>
      </div>
    </>
  );
}
