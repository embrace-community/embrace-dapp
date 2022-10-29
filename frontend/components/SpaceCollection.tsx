import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import getIpfsJsonContent from "../lib/web3storage/getIpfsJsonContent";

import { EmbraceSpace } from "../utils/types";

export default function SpaceCollection({
  title,
  collection,
}: {
  title: string;
  collection: EmbraceSpace[];
}) {
  const [jsonMetadata, setJsonMetadata] = useState<string[]>([]);

  useEffect(() => {
    async function loadMetadataJson() {
      const jsonContents: string[] = [];

      for (const item of collection) {
        const jsonContent = (await getIpfsJsonContent(
          item?.metadata
        )) as string;

        jsonContents.push(jsonContent);
      }

      setJsonMetadata(jsonContents);
    }

    loadMetadataJson();
  }, [collection]);

  console.dir(jsonMetadata);

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
        {collection &&
          collection.map((collectionItem, i) => {
            return (
              <Link
                key={collectionItem.handle + i}
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
          })}
      </div>
    </div>
  );
}
