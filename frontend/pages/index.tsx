import AppLayout from "../components/AppLayout";
import { PlusIcon as PlusIconMini } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <AppLayout title="Home">
        <Link href="/space/create">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 p-3 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIconMini className="h-5 w-5" aria-hidden="true" /> Create Space
          </button>
        </Link>
        <hr />
        List users spaces / List all spaces
      </AppLayout>
    </>
  );
}
