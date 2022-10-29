import Link from "next/link";
import { useRouter } from "next/router";
import { EmbraceSpace } from "../utils/types";

export default function SpaceCollection({
  title,
  collection,
}: {
  title: string;
  collection: EmbraceSpace[];
}) {
  const router = useRouter();
  return (
    <div className="w-full border-t-2 border-embracedark border-opacity-5 pb-14 flex flex-col">
      {title ? (
        <p className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">
          {title}
        </p>
      ) : (
        "no title"
      )}
      <div className="flex flex-row">
        {collection ? (
          collection.map((collectionItem) => {
            return (
              <Link
                key={collectionItem.handle}
                href={`/space/${collectionItem.handle}`}
              >
                <div className="w-48 flex flex-col items-center">
                  <div className="w-32 h-32 mb-5">
                    <img
                      className="extrastyles-collectionItem-img w-full"
                      src={collectionItem.metadata}
                    />
                  </div>
                  <p className="text-embracedark font-semibold">
                    {collectionItem.handle}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
