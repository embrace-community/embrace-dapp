import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useState } from "react";
import getWeb3StorageClient from "../../../lib/web3storage/client";
import Button from "../../Button";
import Spinner from "../../Spinner";

export default function CreateCreation({ id }: { id: string }) {
  const router = useRouter();
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState<string>("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
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

  // Creation form

  // If new then set initial state values to empty

  // If edit then load the creation from the database

  return (
    <>
      <Button
        additionalClassName="p-2 mb-5"
        buttonProps={{ onClick: () => router.back() }}
      >
        Back
      </Button>

      <div className="max-w-lg pl-8">
        {isImageLoading && <Spinner />}

        <>
          <div className="mb-7">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-embracedark"
            >
              Avatar
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
                onChange={(e) => handleFileChange(e)}
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
              htmlFor="handle"
              className="block text-sm font-medium text-embracedark"
            >
              Handle
            </label>

            <div className="mt-2">
              <input
                type="text"
                name="handle"
                id="handle"
                className="block bg-transparent w-full text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                placeholder="The handle of your new space"
                onChange={(e) => setHandle(e.target.value)}
                value={handle}
              />
            </div>
          </div>

          <div className="mb-7">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-embracedark"
            >
              About
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
            <label className="block text-sm font-medium text-embracedark">
              Visibility
            </label>
          </div>
        </>
      </div>
    </>
  );
}
