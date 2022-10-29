import { ChangeEvent, useState } from "react";
import AppLayout from "../../components/AppLayout";
import getWeb3StorageClient from "../../lib/web3storage/client";
import saveToIpfs from "../../lib/web3storage/saveToIpfs";
import Link from "next/link";

export default function SpaceViewPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState("");

  const visOptions = [
    { id: 'public', title: 'Public' },
    { id: 'private', title: 'Private' },
    { id: 'anonymous', title: 'Anonymous' },
  ]

  const appOptions = [
    { id: '0', title: 'discussion', descr: 'A forum to discuss topics' },
    { id: '1', title: 'proposals', descr: 'Create and vote on proposals'  },
    { id: '2', title: 'chat', descr: 'Chat in channels and direct messages'  },
  ]

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
    if (!name || !description || !handle || !imageCid) {
      setError("Please give your space a name, a handle, an avatar and a description/about");
      return;
    }

    const data = {
      name,
      description,
      image: imageCid,
    };

    try {
      setIsLoading(true);

      const cid = (await saveToIpfs(
        data,
        `${data.name.replaceAll(" ", "_")}.json`
      )) as string;

      if (!cid) console.error("Failed to save post to IPFS");
      else console.log("Uploaded json to ipfs, CID: ", cid);
    } catch (error) {
      console.error("Failed to save post to IPFS");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
     <AppLayout title="Create Space">
      <div className="flex flex-col pb-28">
        <div className="w-full border-t-2 border-embracedark border-opacity-5 mb-6 flex flex-row align-middle">
          <h1 className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">creating a new space</h1>
          <a className="text-sm text-embracedark text-opacity-70 mt-2 ml-6 underline" href="/">cancel</a>
        </div>
        <div className="max-w-lg pl-8">
          {isLoading && <div>I am a spinner</div>}

          <div className="mb-7">
            <label htmlFor="description" className="block text-sm font-medium text-embracedark">
              Avatar
            </label>
            {image && <img className="w-36 my-5 extrastyles-border-radius" src={URL.createObjectURL(image)} />}
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                className="text-sm text-violet-500
                file: file:py-1 file:px-6
                file:rounded-full file:border-2
                file:border-violet-500
                file:text-sm file:font-medium
                file:bg-transparent file:text-violet-500"
                onChange={(e) => handleFileChange(e)}
              />
            </div>
          </div>

          <div className="mb-7">
            <label htmlFor="name" className="block text-sm font-medium text-embracedark">
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                className="block bg-transparent text-embracedark w-full rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
                placeholder="The name of your new space"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-7">
            <label htmlFor="handle" className="block text-sm font-medium text-embracedark">
              Handle
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="handle"
                id="handle"
                className="block bg-transparent w-full text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
                placeholder="The handle of your new space"
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
          </div>


          <div className="mb-7">
            <label htmlFor="description" className="block text-sm font-medium text-embracedark">
              About
            </label>
            <div className="mt-1">
              <textarea
                name="description"
                id="description"
                className="block bg-transparent w-full text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
                placeholder="Description of new space"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-7">
            <label className="block text-sm font-medium text-emnbracedark">Visibility</label>
            <fieldset className="mt-2">
              <legend className="sr-only">Visibility</legend>
              <div className="space-y-3 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {visOptions.map((visOption) => (
                  <div key={visOption.id} className="flex items-center">
                    <input
                      id={visOption.id}
                      name="vis-method"
                      type="radio"
                      defaultChecked={visOption.id === 'public'}
                      className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                    />
                    <label htmlFor={visOption.id} className="ml-2 block text-sm font-medium text-embracedark">
                      {visOption.title}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="space-y-2 mt-12 mb-10">
          <label className="block text-sm font-medium text-emnbracedark">Apps</label>
            <legend className="sr-only">Apps</legend>
            <div className="relative flex items-start bg-white py-6 px-7">
              <div className="flex h-5 items-center">
                <input
                  id="discussion"
                  aria-describedby="discussion-description"
                  name="discussion"
                  type="checkbox"
                  checked
                  className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="discussion" className="font-medium text-embracedark">
                  discussion
                </label>
                <p id="discussion-description" className="text-embracedark text-opacity-50">
                A forum to discuss topics
                </p>
              </div>
            </div>


            <div className="relative flex items-start bg-white py-6 px-7">
              <div className="flex h-5 items-center">
                <input
                  id="proposals"
                  aria-describedby="proposals-description"
                  name="proposals"
                  type="checkbox"
                  className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="proposals" className="font-medium text-embracedark">
                  proposals
                </label>
                <p id="proposals-description" className="text-embracedark text-opacity-50">
                Create and vote on proposals
                </p>
              </div>
            </div>

            <div className="relative flex items-start bg-white py-6 px-7">
              <div className="flex h-5 items-center">
                <input
                  id="chat"
                  aria-describedby="chat-description"
                  name="chat"
                  type="checkbox"
                  className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="chat" className="font-medium text-embracedark">
                  chat
                </label>
                <p id="chat-description" className="text-embracedark text-opacity-50">
                Chat in channels and direct messages
                </p>
              </div>
            </div>
          </fieldset>
        {error && <div className=" border-y border-embracedark py-3"><p className="block text-sm font-medium text-embracedark">{error}</p></div>}
        {!name || !description || !handle || !imageCid ?
          <div className="mt-10 border-t-2 pt-4 border-embracedark border-opacity-5">
            <p className="text-sm text-embracedark text-opacity-50 mb-2">To create your space, it needs:</p>
            <ul className="text-sm text-embracedark text-opacity-50">
              {!imageCid &&  <li>• an avatar</li>}
              {!name &&  <li>• a name</li>}
              {!handle &&  <li>• a handle</li>}
              {!description && <li>• description</li>}
            </ul>
          </div>
          :
          <></>
        }
       
        <div className="flex flex-row mt-6 align-middle">
          <Link href="/" className="mt-2 mr-4 text-violet-500 font-semibold underline">cancel</Link>
          <button
            className="
            inline-flex
            items-center
            rounded-full
            border-violet-500
            border-2
            bg-transparent
            py-2
            px-10
            text-violet-500
            shadow-sm
            focus:outline-none
            focus:ring-none
            font-semibold
            disabled:opacity-30"
            disabled={!name || !description || !handle || !imageCid}
            onClick={() => sendMetadataToIpfs()}>
            create space!
          </button>
        </div>

        </div>
        </div>
      </AppLayout>

    

    </>
  );
}
