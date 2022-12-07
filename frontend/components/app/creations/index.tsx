import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Router } from "next/router";
import { useState } from "react";
import { Space } from "../../../types/space";
import Button from "../../Button";
import CreateCreation from "./CreateCreation";
import ViewCreation from "./ViewCreation";
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const creations = [
  {
    id: 1,
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    id: 2,
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    id: 3,
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    id: 4,
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  {
    id: 5,
    title: "IMG_4985.HEIC",
    size: "3.9 MB",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  },
  // More files...
];

const collections = [
  {
    id: 1,
    name: "Primary",
  },
  {
    id: 2,
    name: "Video Blog",
  },
];

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  const creationId = query.id as string;
  const view = query.view as string;

  console.log("creationId", creationId);

  if (view === "form") {
    return <CreateCreation id={creationId} />;
  }

  if (creationId) {
    return <ViewCreation id={creationId} />;
  }

  return (
    <div className="w-full flex flex-row grow">
      <>
        <div className="hidden md:w-1/5 md:flex flex-col my-1 sm:m-4">
          <h1 className="text-lg font-medium leading-6 embracedark underline sm:truncate">
            Collections
          </h1>
          {collections.map((collection) => (
            <div
              key={collection.id}
              className={classNames({
                "flex flex-row items-center justify-between p-2 rounded-lg cursor-pointer":
                  true,
                "bg-gray-100": collection.id === selectedCollection.id,
              })}
              onClick={() => setSelectedCollection(collection)}
            >
              <span>{collection.name}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col my-1 sm:mb-4 ">
          <div className="flex flex-row items-center justify-between p-2 mb-5">
            <Link href={`/${query.handle}/creations?view=form`}>
              <Button additionalClassName="p-2">+ new creation</Button>
            </Link>
          </div>

          <ul
            role="list"
            className="w-full grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 xl:gap-x-8"
          >
            {creations.map((creation, i) => (
              <Link
                href={`/${query.handle}/creations?id=${creation.id}`}
                key={creation.source + i}
              >
                <li className="relative">
                  <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <Image
                      src={creation.source}
                      alt={creation.title}
                      width="0"
                      height="0"
                      sizes="w-full"
                      className="pointer-events-none object-cover group-hover:opacity-75"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 focus:outline-none"
                    >
                      <span className="sr-only">Open {creation.title}</span>
                    </button>
                  </div>
                  <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                    {creation.title}
                  </p>
                  <p className="pointer-events-none block text-sm font-medium text-gray-500">
                    {creation.size}
                  </p>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </>
    </div>
  );
}
