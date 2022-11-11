export default function Proposals({ query, space }) {
  console.log("proposals index.tsx", query, space);
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
        + new proposal
      </button>
      list proposals
    </>
  );
}
