import { Router } from "next/router";
import { Space } from "../../../types/space";
import VideoCalling from "./VideoCalling";

export default function Chat({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  console.log("chat index.tsx", query, space);
  return <VideoCalling handle={query.handle} />;
}
