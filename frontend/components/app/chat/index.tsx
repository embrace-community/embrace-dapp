import { Router } from "next/router";
import { EmbraceSpace } from "../../../types/space";

export default function Chat({
  query,
  space,
}: {
  query: Router["query"];
  space: EmbraceSpace;
}) {
  console.log("chat index.tsx", query, space);
  return (
    <>chat server - allow text chat, initiate video call, initiate audio call</>
  );
}
