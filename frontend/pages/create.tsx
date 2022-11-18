import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useSigner } from "wagmi";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import {
  memberAccessOptions,
  memberTokenOptions,
  setNextMembershipAccess,
  setNextVisibility,
  visOptions,
} from "../components/pages/create/utils";
import Spinner from "../components/Spinner";
import EmbraceSpaces from "../data/contractArtifacts/EmbraceSpaces.json";
import useEmbraceContracts from "../hooks/useEmbraceContracts";
import getWeb3StorageClient from "../lib/web3storage/client";
import { getIpfsJsonContent } from "../lib/web3storage/getIpfsJsonContent";
import saveToIpfs from "../lib/web3storage/saveToIpfs";
import { Access, MembershipGateToken, Visibility } from "../types/space";

export default function SpaceViewPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

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
  const [membershipAccess, setMembershipAccess] = useState<number>(0);
  const [membershipToken, setMembershipToken] = useState<number>(0);
  const [membershipTokenAddress, setMembershipTokenAddress] =
    useState<string>("");
  const [allowMembershipRequests, setAllowMembershipRequests] =
    useState<boolean>(false);

  const [apps, setApps] = useState<number[]>([]);
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState<string>("");

  const [metadataCid, setMetadataCid] = useState("");
  const [tx, setTx] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [spaceCreationMessage, setSpaceCreationMessage] = useState<string>(
    "We're just setting up your space"
  );

  const isVisibilityPrivate =
    visibility === visOptions.findIndex((opt) => opt.id === Visibility.PRIVATE);

  const isVisibilityAnon =
    visibility !==
    visOptions.findIndex((opt) => opt.id === Visibility.ANONYMOUS);

  const isMembershipGated =
    membershipAccess ===
    memberAccessOptions.findIndex((opt) => opt.id === Access.GATED)!;

  const isMembershipClosed =
    membershipAccess ===
    memberAccessOptions.findIndex((opt) => opt.id === Access.CLOSED)!;

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

    if (isVisibilityPrivate && isMembershipGated && !membershipTokenAddress) {
      setError(
        "Please provide a token address if you want the membershipAccess to be token gated."
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
        // Pass CID to createSpace as the state variable is not updated immediately
        createSpace(cid);
      }
    } catch (err: any) {
      console.error(`Failed to save post to IPFS, ${err.message}`);
    }
  }

  async function createSpace(metadataCid: string) {
    try {
      if (signer) {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
          EmbraceSpaces.abi,
          signer as ethers.Signer
        );

        let allowRequests = false;
        if (isVisibilityPrivate! && isMembershipClosed) {
          allowRequests = allowMembershipRequests;
        }

        const spaceMembership = {
          access: memberAccessOptions[membershipAccess].id,

          gate: {
            token: isMembershipGated
              ? membershipToken + 1
              : MembershipGateToken.NONE,
            tokenAddress: membershipTokenAddress
              ? membershipTokenAddress
              : ethers.constants.AddressZero,
          },

          allowRequests,
        };

        contract.on("SpaceCreated", (spaceId, founder) => {
          setSpaceCreationMessage("Space created! Redirecting to space...");

          setTimeout(() => {
            redirectToSpace();
          }, 1000);
        });

        setTimeout(() => {
          setSpaceCreationMessage(
            "Making sure everything is ready for your community..."
          );
        }, 10000);

        const tx = await contract.createSpace(
          ethers.utils.formatBytes32String(handle),
          visibility,
          spaceMembership,
          apps,
          metadataCid,
          {
            gasLimit: 1000000,
          }
        );

        if (tx) {
          console.log(`Creating spaces...tx ${JSON.stringify(tx)}`);

          setTx(tx?.hash);
          setCurrentStep(3);
          return;
        }

        console.error("TX not set: user likely rejected transaction");
        // setShowModal(true);
      } else {
        console.error("No signer found");
      }
    } catch (err: any) {
      console.error(`Failed to create space ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function redirectToSpace() {
    // TODO: Stop listening to events
    router.push(`/spaces/${handle}`);
  }

  function onFinishModal() {
    setShowModal(false);

    router.push("/");
  }

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
            {currentStep === 1 && (
              <>
                <div className="mb-7">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-embracedark"
                  >
                    Avatar
                  </label>

                  {image && (
                    <img
                      className="w-36 my-5 extrastyles-border-radius"
                      src={URL.createObjectURL(image)}
                    />
                  )}

                  <div className="mt-2">
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

                  <div className="mt-2">
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

                  <div className="mt-2">
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

                  <div className="mt-2">
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

                    <div className="sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                      {visOptions.map((visOption, i) => (
                        <div key={visOption.id} className="flex items-center">
                          <input
                            id={`vis-${visOption.id}`}
                            name="vis-method"
                            type="radio"
                            onChange={(e) =>
                              setNextVisibility({
                                e,
                                setVisibility,
                                i,
                                membershipAccess,
                                setMembershipAccess,
                              })
                            }
                            checked={i === visibility}
                            className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                          />
                          <label
                            htmlFor={`vis-${visOption.id}`}
                            className="ml-2 block text-sm font-medium text-embracedark"
                          >
                            {visOption.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  <div className="mt-2 italic text-sm font-medium text-embracedark">
                    Public is open to everyone to join, private can require
                    access through a token or user membership requests,
                    anonymous doesn't track any identity.
                  </div>
                </div>

                <div className={`mb-7 ${isVisibilityAnon ? "" : "hidden"}`}>
                  <label className="block text-sm font-medium text-embracedark">
                    Membership Access
                  </label>
                  <fieldset className="mt-2">
                    <legend className="sr-only">Membership Access</legend>

                    <div className="sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                      {memberAccessOptions.map((memberAccessOption, i) => (
                        <div
                          key={`${memberAccessOption.id}-opt`}
                          className={`flex items-center`}
                        >
                          <input
                            id={`${memberAccessOption.id}`}
                            name="member-access-method"
                            type="radio"
                            onChange={(e) =>
                              setNextMembershipAccess({
                                e,
                                setMembershipAccess,
                                i,
                                visibility,
                                setVisibility,
                              })
                            }
                            checked={i === membershipAccess}
                            className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                          />
                          <label
                            htmlFor={`${memberAccessOption.id}`}
                            className="ml-2 block text-sm font-medium text-embracedark"
                          >
                            {memberAccessOption.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset
                    className={`mt-2 ${isMembershipGated ? "" : "hidden"}`}
                  >
                    <legend className="sr-only">Membership Token</legend>
                    <div className="sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                      {memberTokenOptions.map((memberTokenOption, i) => {
                        return (
                          <div
                            key={`member-${memberTokenOption.id}`}
                            className="flex items-center"
                          >
                            <input
                              id={`member-${memberTokenOption.id}`}
                              name="member-token-method"
                              type="radio"
                              onChange={(e) => {
                                if (e.target.checked) setMembershipToken(i);
                              }}
                              checked={i === membershipToken}
                              className="h-3 w-3 border-embracedark text-embracedark focus:ring-0 bg-transparent focus:bg-transparent"
                            />
                            <label
                              htmlFor={`member-${memberTokenOption.id}`}
                              className="ml-2 block text-sm font-medium text-embracedark"
                            >
                              {memberTokenOption.title}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset
                    className={`mt-2 ${isMembershipGated ? "" : "hidden"}`}
                  >
                    <input
                      placeholder="Token Address"
                      type="text"
                      value={membershipTokenAddress}
                      onChange={(e) =>
                        setMembershipTokenAddress(e.target.value)
                      }
                      className={`w-full block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm`}
                    />

                    <div
                      className={`mt-1 italic text-sm font-medium text-embracedark`}
                    >
                      Please choose the token standard and type in the address
                      of the deployed contract.
                    </div>
                  </fieldset>

                  <fieldset
                    className={`mt-2 ${isMembershipClosed ? "" : "hidden"}`}
                  >
                    <div>
                      <div className={`sm:flex sm:items-center`}>
                        <input
                          id="allowMembershipRequests"
                          aria-describedby="allowMembershipRequests"
                          name="allowMembershipRequests"
                          type="checkbox"
                          checked={allowMembershipRequests}
                          onChange={() =>
                            allowMembershipRequests
                              ? setAllowMembershipRequests(false)
                              : setAllowMembershipRequests(true)
                          }
                          className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0"
                        />

                        <label
                          htmlFor="allowMembershipRequests"
                          className="ml-2 block text-sm font-medium text-embracedark"
                        >
                          Allow Requests
                        </label>
                      </div>

                      <div
                        className={`mt-1 italic text-sm font-medium text-embracedark ${
                          isVisibilityPrivate && isMembershipClosed
                            ? ""
                            : "hidden"
                        }`}
                      >
                        Are other users allowed to request access to the private
                        space?
                      </div>
                    </div>
                  </fieldset>
                </div>
              </>
            )}

            {error && currentStep == 1 && (
              <div className="border-y border-embracedark py-3">
                <p className="block text-sm font-medium text-embracedark">
                  {error}
                </p>
              </div>
            )}

            {currentStep == 1 &&
              (!name || !description || !handle || !imageCid) && (
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
              )}

            {currentStep === 2 && (
              <fieldset className="space-y-2 mt-12 mb-10">
                <label className="block text-sm font-medium text-embracedark mb-3">
                  Apps
                </label>

                <legend className="sr-only">Apps</legend>

                {deployedApps.isLoading ? (
                  <Spinner />
                ) : (
                  deployedApps.apps.map((app, i) => {
                    const name = app?.code;

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
            )}

            {currentStep === 3 && (
              <fieldset className="space-y-2 mt-12 mb-10">
                <label className="block text-sm font-medium text-embracedark mb-3">
                  {spaceCreationMessage}
                </label>

                <Spinner />
              </fieldset>
            )}

            <div className="flex flex-row mt-6 align-middle">
              {currentStep === 1 && (
                <>
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
                      (isVisibilityPrivate &&
                        isMembershipGated &&
                        !membershipTokenAddress)
                    }
                    onClick={() => setCurrentStep(2)}
                  >
                    choose apps &rarr;
                  </button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <button
                    onClick={(e) => setCurrentStep(1)}
                    className="mt-2 mr-4 text-violet-500 font-semibold underline"
                  >
                    back
                  </button>
                  <button
                    className=" inline-flex items-center rounded-full border-violet-500 border-2 bg-transparent py-2 px-10 text-violet-500 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30"
                    disabled={
                      !name ||
                      !description ||
                      !handle ||
                      !imageCid ||
                      (isVisibilityPrivate &&
                        isMembershipGated &&
                        !membershipTokenAddress)
                    }
                    onClick={() => onSubmit()}
                  >
                    {isLoading ? <Spinner /> : "create space!"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </AppLayout>

      <Modal
        title={
          <h5 className="text-xl font-medium leading-normal text-gray-800">
            Creating Space in progress
          </h5>
        }
        body={
          <>
            To see your transaction in the blockchain explorer,{" "}
            <a
              target="_blank"
              href={`${process.env.NEXT_PUBLIC_BLOCKEXPLORER_URL}/${tx}`}
              className="text-violet-500"
            >
              please following this link
            </a>
            .
          </>
        }
        footer={
          <button
            className="px-6 py-2.5 bg-violet-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-violet-500 hover:shadow-lg focus:bg-violet-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-violet-800 active:shadow-lg transition duration-150 ease-in-out"
            onClick={() => onFinishModal()}
          >
            Close & return to Spaces
          </button>
        }
        {...{
          showModal,
          setShowModal,
        }}
      />
    </>
  );
}
