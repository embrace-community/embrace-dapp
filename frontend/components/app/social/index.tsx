import { Router } from "next/router";
import { Space } from "../../../types/space";

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  console.log("chat index.tsx", query, space);
  return <>Social / Lens</>;
}
