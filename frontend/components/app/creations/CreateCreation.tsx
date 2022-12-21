import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useState } from "react";
import getWeb3StorageClient from "../../../lib/web3storage/client";
import Button from "../../Button";
import Spinner from "../../Spinner";
import * as mime from "mime";
import classNames from "classnames";

const creationTypes = [
  { id: "video", title: "Video" },
  { id: "audio", title: "Audio", disabled: true },
  { id: "image", title: "Image", disabled: true },
  { id: "article", title: "Article", disabled: true },
];

export default function CreateCreation({ id }: { id: number }) {
  const router = useRouter();
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState<string>("");
  // const [creation, setCreation] = useState<null | File>(null);
  const [creationCid, setCreationCid] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [creationMime, setCreationMime] = useState<string>("");
  const [isCreationLoading, setIsCreationLoading] = useState<boolean>(false);

  async function uploadThumbnail(e: ChangeEvent<HTMLInputElement>) {
    /* upload cover image to ipfs and save content to state */
    const uploadedFile = e?.target?.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsImageLoading(true);

      const uploadedCid = await getWeb3StorageClient().put([uploadedFile], {
        wrapWithDirectory: false,
      });
      console.log("Uploaded image to ipfs, CID: ", uploadedCid);

      setImage(uploadedFile);
      setImageCid(uploadedCid);
    } catch (err: any) {
      console.log("Error: ", err.message);
    } finally {
      setIsImageLoading(false);
    }
  }

  async function uploadCreation(e: ChangeEvent<HTMLInputElement>) {
    /* upload cover image to ipfs and save content to state */
    const uploadedFile = e?.target?.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsCreationLoading(true);

      const uploadedCid = await getWeb3StorageClient().put([uploadedFile], {
        wrapWithDirectory: false,
      });
      console.log("Uploaded creation to ipfs, CID: ", uploadedCid);
      setCreationCid(uploadedCid);

      const _mime = mime.getType(uploadedFile.name);
      setCreationMime(_mime);
    } catch (err: any) {
      console.log("Error: ", err.message);
    } finally {
      setIsCreationLoading(false);
    }
  }

  return (
    <>
      <div className="w-full  mb-6 flex flex-row align-middle">
        <Link
          className="text-sm text-embracedark text-opacity-70 mt-2 ml-10 underline"
          href="/"
          onClick={() => router.back()}
        >
          cancel
        </Link>
      </div>

      <div className="w-full flex flex-row grow">
        <div className="w-full flex flex-col ml-10 p-4">
          {(isImageLoading || isCreationLoading) && <Spinner />}

          <div className="w-full md:w-3/4">
            <div className="mb-7">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-embracedark"
              >
                Creation
              </label>

              <div className="mt-2">
                <input
                  type="file"
                  accept="video/*"
                  className="text-sm text-violet-600
                file: file:py-1 file:px-6
                file:rounded-full file:border-2
                file:border-violet-600
                file:text-sm file:font-medium
                file:bg-transparent file:text-violet-600"
                  onChange={(e) => uploadCreation(e)}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-embracedark"
              >
                Thumbnail
              </label>

              {image && (
                <Image
                  className="w-48 h-48 rounded-lg my-5"
                  src={URL.createObjectURL(image)}
                  alt="image to upload"
                  width={192}
                  height={192}
                />
              )}

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-violet-600
                file: file:py-1 file:px-6
                file:rounded-full file:border-2
                file:border-violet-600
                file:text-sm file:font-medium
                file:bg-transparent file:text-violet-600"
                  onChange={(e) => uploadThumbnail(e)}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-embracedark"
              >
                Name
              </label>

              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block bg-transparent text-embracedark w-full rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                  placeholder="The name of your new space"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-embracedark"
              >
                Description
              </label>

              <div className="mt-2">
                <textarea
                  name="description"
                  id="description"
                  className="block bg-transparent w-full resize-none text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                  placeholder="Description of new space"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />
              </div>
            </div>

            <div className="mb-7">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-embracedark"
              >
                Type
              </label>

              <div className="space-y-4 m-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {creationTypes.map((creationType) => (
                  <div key={creationType.id} className="flex items-center">
                    <input
                      id={creationType.id}
                      name="notification-method"
                      type="radio"
                      disabled={creationType.disabled}
                      className={classNames({
                        "h-4 w-4 border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer":
                          true,
                        "opacity-50": creationType.disabled,
                      })}
                      onChange={(e) => setType(e.target.value)}
                    />
                    <label
                      htmlFor={creationType.id}
                      className={classNames({
                        "ml-3 block text-sm font-medium text-embracedark cursor-pointer":
                          true,
                        "opacity-50": creationType.disabled,
                      })}
                    >
                      {creationType.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full hidden md:flex flex-col align-middle">
          video preview
        </div>
      </div>
    </>
  );
}
