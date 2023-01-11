export default function TopicItem({ id, spaceId, address, title, content }) {
  return (
    <>
      <div
        className="w-full border-b-2 border-embrace-dark border-opacity-5 pb-7 mt-5 text-embrace-dark"
        key={id}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm font-normal mt-1">{address}</p>
        <p className="text-md font-normal mt-1">{content}</p>
        <p className="text-md font-normal mt-1">{spaceId}</p>
      </div>
    </>
  );
}
