import { Router } from "next/router";
import { EmbraceSpace } from "../../../utils/types";

export default function Chat({
  query,
  space,
}: {
  query: Router["query"];
  space: EmbraceSpace;
}) {
  console.log("chat index.tsx", query, space);
  return <>chat app</>;
}
