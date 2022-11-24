export default function DiscussionTopicComment({
  id,
  spaceId,
  address,
  content,
}) {
  return (
    <>
      <div className="flex flex-col mb-10">
        <span className="font-bold text-indigo-500">{id}</span>
        <span>Space #{spaceId}</span>
        <span>{address}</span>
        <span>{content}</span>
      </div>
    </>
  );
}
