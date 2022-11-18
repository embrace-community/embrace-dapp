import { ethers } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../lib/web3storage/getIpfsJsonContent";

import { EmbraceSpace } from "../types/space";

export default function SpaceCollection({
  title,
  collection,
}: {
  title: string;
  collection: EmbraceSpace[];
}) {
  const [_jsonMetadata, setJsonMetadata] = useState<Record<string, any>[]>([]);
  const [metadataImg, setMetadataImg] = useState<string[]>([]);

  useEffect(() => {
    async function loadMetadataJson() {
      const jsonContents: Record<string, any>[] = [];
      const images: string[] = [];

      for (const item of collection) {
        const jsonContent = (await getIpfsJsonContent(
          item?.metadata
        )) as Record<string, any>;

        jsonContents.push(jsonContent);

        if (jsonContent?.image) {
          const image = getFileUri(jsonContent.image);

          images.push(image);
        } else {
          // So that images array maps correctly to collection of spaces otherwise images will not match up
          images.push("");
        }
      }

      setJsonMetadata(jsonContents);
      setMetadataImg(images);
    }

    loadMetadataJson();
  }, [collection]);

  return (
    <div className="w-full border-t-2 border-embracedark border-opacity-5 pb-14 flex flex-col">
      {title ? (
        <p className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">
          {title}
        </p>
      ) : (
        "no title"
      )}
      <div className="flex flex-row flex-wrap">
        {collection &&
          collection.map((collectionItem, i) => {
            const handleString = collectionItem.handle
              ? ethers.utils.parseBytes32String(collectionItem.handle)
              : "";

            return (
              <Link
                key={collectionItem.handle + i}
                href={`/${handleString}/home`}
              >
                <div className="w-48 flex flex-col items-center">
                  <div className="w-32 h-32 mb-5 flex items-center justify-center">
                    <img
                      className="extrastyles-collectionItem-img w-full"
                      src={metadataImg?.[i]}
                    />
                  </div>

                  <p className="text-embracedark font-semibold">
                    {handleString}
                  </p>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
