import { Router } from "next/router";
import { useState } from "react";
import { useGetOwnPosts } from "../../../hooks/app/chat/usePosts";
import { Space } from "../../../types/space";

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const posts = useGetOwnPosts(currentPage);

  console.log("chat index.tsx", query, space);
  return <>Social / Lens</>;
}
