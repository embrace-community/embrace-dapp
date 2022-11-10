import { useSigner } from "wagmi";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Spinner from "../components/Spinner";
import EmbraceSpaces from "../data/contractArtifacts/EmbraceSpaces.json";
import getWeb3StorageClient from "../lib/web3storage/client";
import saveToIpfs from "../lib/web3storage/saveToIpfs";
import useEmbraceContracts from "../hooks/useEmbraceContracts";
import getIpfsJsonContent from "../lib/web3storage/getIpfsJsonContent";
import { MembershipType } from "../utils/types";

export default function SpaceViewPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [deployedApps, setDeployedApps] = useState({
    isLoading: false,
    loaded: false,
    apps: [] as Record<string, any>[],
    appsMetadata: [] as Record<string, any>[],
    error: "",
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [visibility, setVisibility] = useState<number>(0);
  const [membership, setMembership] = useState<number>(0);
  const [tokenMembershipAddress, setTokenMembershipAddress] =
    useState<string>("");
  const [apps, setApps] = useState<number[]>([]);
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState("");

  const [metadataCid, setMetadataCid] = useState("");

  const visOptions = [
    { id: "public", title: "Public" },
    { id: "private", title: "Private" },
    { id: "anonymous", title: "Anonymous" },
  ];

  const memberOptions = [
    { id: "public", title: "Public" },
    { id: "token_gated", title: "Token Gated" },
  ];

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
    } catch (err: any) {
      console.log("Error: ", err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMetadataToIpfs() {
    const data = {
      name,
      description,
      image: imageCid,
      handle,
    };

    try {
      const cid = (await saveToIpfs(
        data,
        `${data.name.replaceAll(" ", "_")}.json`
      )) as string;

      if (!cid) console.error("Failed to save post to IPFS");
      else {
        console.log("Uploaded json to ipfs, CID: ", cid);
        setMetadataCid(cid);
      }
    } catch (err: any) {
      console.error(`Failed to save post to IPFS, ${err.message}`);
    }
  }

  const { data: signer } = useSigner();
  const router = useRouter();

  // When submitting the form save the metadata IPFS and create the space once the metadata CID is set
  async function onSubmit() {
    if (!name || !description || !handle || !imageCid) {
      setError(
        "Please give your space a name, a handle, an avatar and a description/about"
      );
      return;
    }

    if (
      membership ===
        memberOptions.findIndex((opt) => opt.id === "token_gated") &&
      !tokenMembershipAddress
    ) {
      setError(
        "Please provide a token address if you want the membership to be token gated."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (signer) {
        await sendMetadataToIpfs();
      } else {
        console.error("No signer found");
      }
    } catch (err: any) {
      console.error(`Failed to save metadata ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Only create a space once the metadata has been saved to ipfs and the CID is set in state
  useEffect(() => {
    if (!metadataCid.length) return;

    async function createSpace() {
      try {
        if (signer) {
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
            EmbraceSpaces.abi,
            signer as ethers.Signer
          );

          const spaceMembership = {
            kind:
              membership ===
              memberOptions.findIndex((opt) => opt.id === "token_gated")
                ? MembershipType.TOKEN_GATED
                : MembershipType.PUBLIC,
            tokenAddress: tokenMembershipAddress
              ? tokenMembershipAddress
              : ethers.constants.AddressZero,
          };

          await contract.createSpace(
            ethers.utils.formatBytes32String(handle),
            visibility,
            spaceMembership,
            apps,
            metadataCid
          );

          router.push("/");
        } else {
          console.error("No signer found");
        }
      } catch (err: any) {
        console.error(`Failed to create space ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    createSpace();
  }, [metadataCid]);

  const { appsContract } = useEmbraceContracts();

  useEffect(() => {
    async function getApps() {
      if (!signer || deployedApps.isLoading || deployedApps.loaded) return;

      setDeployedApps((prevState) => ({ ...prevState, isLoading: true }));

      try {
        const apps = await appsContract?.getApps?.();

        const appsMetadata: Record<string, any>[] = [];
        for (const app of apps) {
          const appMetadata = (await getIpfsJsonContent(
            app.metadata,
            "readAsText"
          )) as Record<string, any>;
          appsMetadata.push(appMetadata);
        }

        console.log("Existing Apps", apps, "Apps Metadata", appsMetadata);

        setDeployedApps((prevState) => ({ ...prevState, apps, appsMetadata }));
      } catch (e: any) {
        console.error(e.message);
      } finally {
        setDeployedApps((prevState) => ({
          ...prevState,
          isLoading: false,
          loaded: true,
        }));
      }
    }

    getApps();
  }, [signer, deployedApps]);

  return (
    <>
      <AppLayout title="Create Space">
        <div className="flex flex-col pb-28 extrastyles-specialpadding">
          <div className="w-full border-t-2 border-embracedark border-opacity-5 mb-6 flex flex-row align-middle">
            <h1 className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">
              creating a new space
            </h1>
            <a
              className="text-sm text-embracedark text-opacity-70 mt-2 ml-6 underline"
              href="/"
            >
              cancel
            </a>
          </div>

          <div className="max-w-lg pl-8">
            {isLoading && <Spinner />}

            <div className="mb-7">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-embracedark"
              >
                Avatar
              </label>

              {image && (
                <img
                  className="w-36 my-5 extrastyles-border-radius"
                  src={URL.createObjectURL(image)}
                />
              )}

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
              <label
                htmlFor="name"
                className="block text-sm font-medium text-embracedark"
              >
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

              <div className="mt-1">
                <input
                  type="text"
                  name="handle"
                  id="handle"
                  className="block bg-transparent w-full text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
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

              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  className="block bg-transparent w-full text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
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

              <fieldset className="mt-2">
                <legend className="sr-only">Visibility</legend>

                <div className="space-y-3 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                  {visOptions.map((visOption, i) => (
                    <div key={visOption.id} className="flex items-center">
                      <input
                        id={visOption.id}
                        name="vis-method"
                        type="radio"
                        onChange={(e) => {
                          if (e.target.checked) setVisibility(i);
                        }}
                        checked={i === visibility}
                        className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                      />
                      <label
                        htmlFor={visOption.id}
                        className="ml-2 block text-sm font-medium text-embracedark"
                      >
                        {visOption.title}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mb-7">
              <label className="block text-sm font-medium text-embracedark">
                Membership
              </label>

              <fieldset className="mt-2">
                <legend className="sr-only">Membership</legend>

                <div className="space-y-3 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                  {memberOptions.map((memberOption, i) => (
                    <div
                      key={memberOption.id}
                      className={`flex items-center${
                        i === memberOptions.length - 1 ? " w-full" : ""
                      }`}
                    >
                      <input
                        id={memberOption.id}
                        name="member-method"
                        type="radio"
                        onChange={(e) => {
                          if (e.target.checked) setMembership(i);
                        }}
                        checked={i === membership}
                        className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                      />
                      <label
                        htmlFor={memberOption.id}
                        className="ml-2 block text-sm font-medium text-embracedark"
                      >
                        {memberOption.title}
                      </label>

                      {memberOption.id === "token_gated" && (
                        <input
                          placeholder="Token Address"
                          type="text"
                          value={tokenMembershipAddress}
                          onChange={(e) => {
                            setTokenMembershipAddress(e.target.value);
                          }}
                          className="w-full ml-10 block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset className="space-y-2 mt-12 mb-10">
              <label className="block text-sm font-medium text-embracedark mb-3">
                Apps
              </label>

              <legend className="sr-only">Apps</legend>

              {deployedApps.isLoading ? (
                <Spinner />
              ) : (
                deployedApps.apps.map((app, i) => {
                  const name =
                    app?.code && ethers.utils.parseBytes32String(app.code);

                  return (
                    <div
                      key={`app-${i}`}
                      className="relative flex items-start bg-white py-6 px-7"
                    >
                      <div className="flex h-5 items-center">
                        <input
                          id={name}
                          aria-describedby={`${name}-app`}
                          name={name}
                          type="checkbox"
                          checked={apps.includes(i)}
                          onChange={() => {
                            apps.includes(i)
                              ? setApps(apps.filter((a) => a !== i))
                              : setApps([...apps, i]);
                          }}
                          className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0"
                        />
                      </div>

                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={name}
                          className="font-medium text-embracedark"
                        >
                          {name}
                        </label>

                        <p
                          id={`${name}-description`}
                          className="text-embracedark text-opacity-50"
                        >
                          {deployedApps.appsMetadata?.[i]?.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </fieldset>

            {error && (
              <div className="border-y border-embracedark py-3">
                <p className="block text-sm font-medium text-embracedark">
                  {error}
                </p>
              </div>
            )}

            {!name || !description || !handle || !imageCid ? (
              <div className="mt-10 border-t-2 pt-4 border-embracedark border-opacity-5">
                <p className="text-sm text-embracedark text-opacity-50 mb-2">
                  To create your space, it needs:
                </p>
                <ul className="text-sm text-embracedark text-opacity-50">
                  {!imageCid && <li>• an avatar</li>}
                  {!name && <li>• a name</li>}
                  {!handle && <li>• a handle</li>}
                  {!description && <li>• description</li>}
                </ul>
              </div>
            ) : (
              <></>
            )}

            <div className="flex flex-row mt-6 align-middle">
              <Link
                href="/"
                className="mt-2 mr-4 text-violet-500 font-semibold underline"
              >
                cancel
              </Link>
              <button
                className=" inline-flex items-center rounded-full border-violet-500 border-2 bg-transparent py-2 px-10 text-violet-500 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30"
                disabled={
                  !name ||
                  !description ||
                  !handle ||
                  !imageCid ||
                  (membership ===
                    memberOptions.findIndex(
                      (opt) => opt.id === "token_gated"
                    ) &&
                    !tokenMembershipAddress)
                }
                onClick={() => onSubmit()}
              >
                {isLoading ? <Spinner /> : "create space!"}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
