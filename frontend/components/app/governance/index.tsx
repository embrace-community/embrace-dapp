export default function Governance({ query, space }) {
  console.log("Governance / proposals index.tsx", query, space);
  return (
    <>
      <button
        className="
                        rounded-full
                        border-indigo-500
                        border-2
                        bg-transparent
                        py-4
                        px-12
                        text-indigo-500
                        shadow-sm
                        focus:outline-none
                        focus:ring-none
                        mb-7
                        font-semibold
                        text-xl"
      >
        + new proposal
      </button>
      list Governance/proposals
    </>
  );
}
