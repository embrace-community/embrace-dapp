import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PlaceholderLoading from "react-placeholder-loading";
import {
  getFileUri,
  getIpfsJsonContent,
} from "../lib/web3storage/getIpfsJsonContent";
import { Space, SpaceMetadata } from "../types/space";
import Spinner from "./Spinner";

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
    [],
  );
  const [metadataImagesError, setMetadataImagesError] = useState<number[]>([]);
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetadataJson() {
      const spaceMetadatas: SpaceMetadata[] = [];
      const images: string[] = [];

      for (const item of collection) {
        if (!item.loadedMetadata) {
          const spaceMetadata = (await getIpfsJsonContent(
            item.metadata,
          )) as SpaceMetadata;

          spaceMetadatas.push(spaceMetadata);

          if (spaceMetadata?.image) {
            images.push(getFileUri(spaceMetadata.image));
          } else {
            // So that images array maps correctly to collection of spaces otherwise images will not match up
            images.push("");
          }
        } else {
          spaceMetadatas.push(item.loadedMetadata);
          images.push(item.loadedMetadata?.image);
        }

        setJsonMetadata(spaceMetadatas);
        setMetadataImages(images);
      }

      setMetadataLoaded(true);
    }

    loadMetadataJson();
  }, [collection]);

  function setImageLoaded(index: number) {
    const imagesLoaded = [...metadataImagesLoaded, index];
    setMetadataImagesLoaded(imagesLoaded);
  }

  function setImageError(index: number) {
    const imagesError = [...metadataImagesError, index];
    setMetadataImagesError(imagesError);
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
          collection?.map((collectionItem, i) => {
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
                    {metadataImages?.[i] && (
                      <Image
                        className="extrastyles-collectionItem-img w-full rounded-full"
                        src={metadataImages?.[i]}
                        alt="Space Logo"
                        onLoad={() => setImageLoaded(i)}
                        onError={() => setImageError(i)}
                        height={32}
                        width={32}
                      />
                    )}
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
