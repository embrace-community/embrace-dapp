import { ethers } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../lib/web3storage/getIpfsJsonContent";

import { Space } from "../types/space";
import Spinner from "./Spinner";
import PlaceholderLoading from "react-placeholder-loading";

export default function SpaceCollection({
  title,
  collection,
}: {
  title: string;
  collection: Space[];
}) {
  const [_jsonMetadata, setJsonMetadata] = useState<Record<string, any>[]>([]);
  const [metadataImages, setMetadataImages] = useState<string[]>([]);
  const [metadataImagesLoaded, setMetadataImagesLoaded] = useState<number[]>(
    []
  );
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetadataJson() {
      const jsonContents: Record<string, any>[] = [];
      const images: string[] = [];

      for (const item of collection) {
        if (typeof item.metadata !== "object" && item.metadata !== null) {
          const jsonContent = (await getIpfsJsonContent(
            item?.metadata as string
          )) as Record<string, any>;

          jsonContents.push(jsonContent);

          if (jsonContent?.image) {
            const src = getFileUri(jsonContent.image);

            images.push(src);
          } else {
            // So that images array maps correctly to collection of spaces otherwise images will not match up
            images.push("");
          }
        } else {
          jsonContents.push(item.metadata);
          images.push(item.metadata?.image);
        }

        setJsonMetadata(jsonContents);
        setMetadataImages(images);
      }

      setMetadataLoaded(true);
    }

    loadMetadataJson();
  }, [collection]);

  // Set all images as loaded after 15 seconds i.e. timed out which will hide all loading placeholders
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMetadataImagesLoaded(collection.map((_, index) => index));
      console.log("Some images amy have timed out");
    }, 15000);
  }, []);

  function setImageLoaded(index: number) {
    const imagesLoaded = [...metadataImagesLoaded, index];
    setMetadataImagesLoaded(imagesLoaded);
  }

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
        {!metadataLoaded && <Spinner />}

        {metadataLoaded &&
          collection &&
          collection.map((collectionItem, i) => {
            const handleString = collectionItem.handle
              ? ethers.utils.parseBytes32String(collectionItem.handle)
              : "";

            return (
              <Link
                key={collectionItem.handle + i}
                href={`/${handleString}/home?spaceId=${collectionItem.id}`}
              >
                <div className="w-48 flex flex-col items-center py-3">
                  <div className="w-32 h-32 mb-5 flex items-center justify-center z-10">
                    <img
                      className="extrastyles-collectionItem-img w-full rounded-full"
                      src={metadataImages?.[i]}
                      onLoad={() => {
                        setImageLoaded(i);
                      }}
                    />
                  </div>

                  {!metadataImagesLoaded.includes(i) && (
                    <div className="absolute">
                      <PlaceholderLoading
                        shape="circle"
                        width={128}
                        height={128}
                      />
                    </div>
                  )}

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
