export default function DiscussionTopic({
  id,
  spaceId,
  address,
  title,
  content,
}) {
  return (
    <>
      <div className="flex flex-col mb-10">
        <span className="font-bold text-violet-500">{id}</span>
        <span>Space #{spaceId}</span>
        <span>{address}</span>
        <span>{title}</span>
        <span>{content}</span>
      </div>
    </>
  );
}
