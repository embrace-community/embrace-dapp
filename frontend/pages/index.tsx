import AppLayout from "../components/AppLayout";
import { PlusIcon as PlusIconMini } from "@heroicons/react/20/solid";
import Link from "next/link";
import SpaceCollection from "../components/SpaceCollection";

export default function HomePage() {
  const spacecollection1 = [
    {
    img:"https://cdn-icons-png.flaticon.com/512/168/168726.png",
    name:"1nametest"
    },
    {
    img:"https://img.freepik.com/free-vector/random-square-halftone-pattern_1409-1062.jpg?w=2000",
    name:"2nametest"
    },
  ];
  const spacecollection2 = [
    {
    img:"test",
    name:"1nametest_col2"
    },
    {
    img:"test",
    name:"2nametest_col2"
    },
  ];

  return (
    <div className="min-h-screen">
      <AppLayout title="Home">
        <div className="test">
          <Link href="/space/create">
            <button
              type="button"
              className="
                inline-flex
                items-center
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
                mb-11
                font-semibold"
            >
              + new space
            </button>
          </Link>
          <SpaceCollection title="your spaces" collection={spacecollection1}/>
          <SpaceCollection title="public spaces" collection={spacecollection2}/>
        </div>
      </AppLayout>
    </div>
  );
}
