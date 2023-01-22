export default function Governance({ query, space }) {
  console.log("Governance / proposals index.tsx", query, space);
  return (
    <>
      <button
        className="
                        rounded-full
                        border-violet-600
                        border-2
                        bg-transparent
                        py-4
                        px-12
                        text-violet-600
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
