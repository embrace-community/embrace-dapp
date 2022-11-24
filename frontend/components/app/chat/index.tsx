import { Router } from "next/router";
import { Space } from "../../../types/space";

export default function Chat({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  console.log("chat index.tsx", query, space);
  return (
    <div className="w-full flex flex-1 h-full flex-row">
      <p>test</p>
      <p>test</p>
      <p>test</p>

      </div>
  );
}
