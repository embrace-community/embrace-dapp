import { ChangeEvent, useState } from "react";
import AppLayout from "../../components/AppLayout";
import getWeb3StorageClient from "../../lib/web3storage/client";
import saveToIpfs from "../../lib/web3storage/saveToIpfs";

export default function SpaceViewPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    /* upload cover image to ipfs and save content to state */
    const uploadedFile = e?.target?.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsLoading(true);

      const uploadedCid = await getWeb3StorageClient().put([uploadedFile], {
        wrapWithDirectory: false,
      });
      console.log("Uploaded image to ipfs, CID: ", uploadedCid);

      setImage(uploadedFile);
      setImageCid(uploadedCid);
    } catch (err) {
      console.log("Error: ", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMetadataToIpfs() {
    if (!name || !description || !imageCid) {
      setError("Please set `name`, `description` and `image`");
      return;
    }

    const data = {
      name,
      description,
      image: imageCid,
    };

    const cid = (await saveToIpfs(
      data,
      `${data.name.replaceAll(" ", "_")}.json`
    )) as string;
    if (!cid) throw Error("Failed to save post to IPFS");
  }

  return (
    <>
      <AppLayout title="Create Space">
        <h1>Space Create</h1>
        <input type="text" onChange={(e) => setName(e.target.value)} />
        <input type="text" onChange={(e) => setDescription(e.target.value)} />

        {image && <img src={URL.createObjectURL(image)} />}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
        />
        {error && <div>{error}</div>}
        <button onClick={() => sendMetadataToIpfs()}>
          Create your new Community!
        </button>
      </AppLayout>
    </>
  );
}
