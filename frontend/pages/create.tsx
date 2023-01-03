import classNames from "classnames";
import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useSigner } from "wagmi";
import AppIcon from "../components/AppIcon";
import AppLayout from "../components/AppLayout";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import {
  memberAccessOptions,
  memberTokenOptions,
  setNextMembershipAccess,
  setNextVisibility,
  visOptions,
} from "../components/pages/create/utils";
import Spinner from "../components/Spinner";
import useEmbraceContracts from "../hooks/useEmbraceContracts";
import { appMappings, tagColours } from "../lib/AppMappings";
import { blockchainExplorerUrl } from "../lib/envs";
import getWeb3StorageClient from "../lib/web3storage/client";

import saveToIpfs from "../lib/web3storage/saveToIpfs";
import { useAppDispatch } from "../store/hooks";
import { addCreatedSpace } from "../store/slices/space";
import { Access, MembershipGateToken, Space, Visibility } from "../types/space";

export default function SpaceViewPage() {
  const { appsContract, spacesContract } = useEmbraceContracts();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const { address: accountAddress } = useAccount();

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
  const [transactionError, setTransactionError] = useState<boolean>(false);
  const [transactionRejected, setTransactionRejected] =
    useState<boolean>(false);

  const [apps, setApps] = useState<number[]>([]);
  const [image, setImage] = useState<null | File>(null);
  const [imageCid, setImageCid] = useState<string>("");

  const [metadataCid, setMetadataCid] = useState("");
  const [tx, setTx] = useState<any>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [spaceCreationMessage, setSpaceCreationMessage] = useState<string>(
    "We're creating your Community Space...",
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
      setIsImageLoading(true);

      console.log(uploadedFile);

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

  // When submitting the form save the metadata IPFS and create the space once the metadata CID is set
  async function onSubmit() {
    if (!name || !description || !handle || !imageCid) {
      setError(
        "Please give your space a name, a handle, an avatar and a description/about",
      );
      return;
    }

    if (isVisibilityPrivate && isMembershipGated && !membershipTokenAddress) {
      setError(
        "Please provide a token address if you want the membershipAccess to be token gated.",
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
    }
  }

  const redirectToSpace = useCallback(
    async (spaceId, founder, spaceObject?: Space) => {
      const spaceIdNum = ethers.BigNumber.from(spaceId).toNumber();
      console.log("Redirecting to space: ", spaceIdNum, founder, spaceObject);

      if (spaceObject) {
        const spaceWithId: Space = { ...spaceObject, id: spaceIdNum };
        console.log("spaceWithId", spaceWithId);
        dispatch(addCreatedSpace(spaceWithId));

        router.push(`/${handle}/home?spaceId=${spaceIdNum}`);
      } else {
        // Shouldn't happen, but just in case
        alert("Something went wrong, please try again later.");
      }
    },
    [dispatch, handle, router],
  );

  useEffect(() => {
    async function getApps() {
      if (!signer || deployedApps.isLoading || deployedApps.loaded) return;

      setDeployedApps((prevState) => ({ ...prevState, isLoading: true }));

      try {
        console.log(appsContract, "appsContract");
        const apps = await appsContract?.getApps();

        setDeployedApps((prevState) => ({ ...prevState, apps }));
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
  }, [signer, deployedApps, appsContract]);

  useEffect(() => {
    if (!metadataCid || !signer) return;

    async function createSpace() {
      try {
        setTransactionError(false);
        setTransactionRejected(false);

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

        if (!spacesContract) {
          console.error("SPACES CONTRACT NOT FOUND");
          return;
        }

        // Create space object to be saved in store upon creation
        // Save the space to the store along with the metadata object
        const space: Space = {
          id: 0,
          handle: handle,
          founder: accountAddress as Address,
          metadata: metadataCid,
          loadedMetadata: {
            name,
            description,
            image: image ? URL.createObjectURL(image) : "",
            handle: handle,
          },
          visibility,
          apps,
          membership: spaceMembership,
          memberCount: 1,
        };

        // TODO: On localhost sometimes an old event is fired, so we need to make sure only the new event triggers the redirect
        spacesContract.on("SpaceCreated", (spaceId, founder) => {
          if (founder !== accountAddress) return;

          setSpaceCreationMessage(
            "Your Community Space has been created! Redirecting...",
          );

          setTimeout(() => {
            spacesContract.removeAllListeners();

            redirectToSpace(spaceId, founder, space);
          }, 1000);
        });

        const tx = await spacesContract.createSpace(
          handle,
          visibility,
          spaceMembership,
          apps,
          metadataCid,
        );

        if (tx) {
          console.log(`Creating spaces...tx ${JSON.stringify(tx)}`);

          setTx(tx?.hash);
          setCurrentStep(3);

          return;
        }

        console.error("TX not set: user likely rejected transaction");
      } catch (err: any) {
        // Most likely user rejected the transaction
        setTransactionRejected(true);
        setMetadataCid(""); // reset metadata CID if transaction is rejected at first (allows user to retry)
        console.error(`Failed to create space: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    createSpace();
  }, [
    accountAddress,
    allowMembershipRequests,
    apps,
    description,
    handle,
    image,
    isMembershipClosed,
    isMembershipGated,
    isVisibilityPrivate,
    membershipAccess,
    membershipToken,
    membershipTokenAddress,
    metadataCid,
    name,
    redirectToSpace,
    signer,
    spacesContract,
    visibility,
  ]);

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
        `${data.name.replaceAll(" ", "_")}.json`,
      )) as string;

      if (cid) {
        console.log("Uploaded json to ipfs, CID: ", cid);
        // useEffect will trigger createSpace once CID is set
        setMetadataCid(cid);
        return;
      }

      console.error("Failed to save post to IPFS");
    } catch (err: any) {
      console.error(`Failed to save post to IPFS, ${err.message}`);
    }
  }

  return (
    <>
      <AppLayout title="Create Space">
        <div className="flex flex-col pt-8 pr-[6.8vw] pb-28 pl-[6.8vw] w-full">
          <div className="w-full border-t-2 border-embracedark border-opacity-5 mb-6 flex flex-row align-middle">
            <h1 className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">
              creating a new space
            </h1>
            <Link
              className="text-sm text-embracedark text-opacity-70 mt-2 ml-6 underline"
              href="/"
            >
              cancel
            </Link>
          </div>

          <div className="w-full">
            {currentStep === 1 && (
              <div className="max-w-lg">
                {isImageLoading && <Spinner />}
                <div className="mb-7">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-embracedark"
                  >
                    Avatar
                  </label>

                  {image && (
                    <Image
                      className="w-36 h-36 rounded-full my-5"
                      src={URL.createObjectURL(image)}
                      alt="image to upload"
                      width={144}
                      height={144}
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
                    anonymous doesn&apos;t track any identity.
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
                      className={`w-full block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm`}
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
              </div>
            )}

            {error && (currentStep == 1 || currentStep == 2) && (
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Apps
                </h3>

                <legend className="sr-only">Apps</legend>
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {deployedApps.isLoading ? (
                    <Spinner />
                  ) : (
                    deployedApps.apps.map((app, i) => {
                      const appId = BigNumber.from(app?.id).toNumber();
                      const appMapping = appMappings[appId];

                      const name: string = appMapping?.title ?? app?.name;
                      const appTags = appMapping?.tags;

                      return (
                        <div
                          key={`app-${appId}`}
                          // className="flex w-full items-start bg-white py-6 px-7 rounded-lg"
                          className={classNames({
                            "flex w-full items-start bg-white py-6 px-7 rounded-lg":
                              true,
                            "opacity-70": !app?.enabled,
                            "cursor-pointer": app?.enabled,
                          })}
                          onClick={() => {
                            if (!app?.enabled) return;
                            apps.includes(appId)
                              ? setApps(apps.filter((a) => a !== appId))
                              : setApps([...apps, appId]);
                          }}
                        >
                          <div className="flex h-5 mt-2">
                            <input
                              id={name}
                              aria-describedby={`${name}-app`}
                              name={name}
                              type="checkbox"
                              checked={apps.includes(appId)}
                              disabled={!app?.enabled}
                              onChange={() => {
                                apps.includes(appId)
                                  ? setApps(apps.filter((a) => a !== appId))
                                  : setApps([...apps, appId]);
                              }}
                              // className="h-5 w-5 rounded-3xl border-gray-300 text-embracedark focus:ring-0 "
                              className={classNames({
                                "h-5 w-5 rounded-3xl border-gray-300 text-violet-500 focus:ring-0":
                                  true,
                                "ring-2 ring-violet-700": apps.includes(appId),
                                "border-gray-100": !app.enabled,
                              })}
                            />
                          </div>

                          <div className="ml-3 text-sm">
                            <label
                              htmlFor={name}
                              className="font-medium text-embracedark"
                            >
                              <AppIcon appId={appId} />

                              <span className="mr-2">{name}</span>

                              {!app?.enabled && (
                                <Badge key={`app-tag-${appId}-${i}`}>
                                  coming soon
                                </Badge>
                              )}
                            </label>

                            <div>
                              {appTags &&
                                appTags.map((tag, i) => {
                                  return (
                                    <Badge
                                      key={`app-tag-${appId}-${i}`}
                                      color={tagColours[tag]}
                                    >
                                      {tag}
                                    </Badge>
                                  );
                                })}
                            </div>

                            <p
                              id={`${name}-description`}
                              className=" pointer-events-none text-embracedark text-opacity-50"
                            >
                              {appMappings[appId]?.description ??
                                "Description text"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </fieldset>
            )}

            {currentStep == 2 && (
              <div className="mt-10 border-t-2 pt-4 border-embracedark border-opacity-5">
                {!apps.length && (
                  <p className="text-sm text-embracedark text-opacity-50 mb-2">
                    To create your space, it needs at least one app
                  </p>
                )}

                {transactionRejected && (
                  <p className="text-sm text-embracedark text-opacity-50 mb-2">
                    Transaction has been rejected, please try again.
                  </p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <fieldset className="space-y-2 mt-12 mb-10">
                {transactionError ? (
                  <>
                    <div className="mt-10 border-t-2 pt-4 border-embracedark border-opacity-5">
                      <p className="text-sm text-embracedark text-opacity-50 mb-2">
                        There has been an error creating your space
                      </p>
                    </div>
                    <a
                      className="text-sm text-embracedark text-opacity-70 mt-2 underline cursor-pointer"
                      onClick={(e) => setCurrentStep(2)}
                    >
                      back to try again
                    </a>
                  </>
                ) : (
                  <div className="text-center">
                    <label className="block text-sm font-medium text-embracedark mb-3">
                      {spaceCreationMessage}
                    </label>
                    <Spinner />
                  </div>
                )}
              </fieldset>
            )}

            <div className="flex flex-row mt-6 align-middle">
              {currentStep === 1 && (
                <>
                  <Link
                    href="/"
                    className="mt-2 mr-4 text-violet-600 font-semibold underline"
                  >
                    cancel
                  </Link>
                  <button
                    className="inline-flex items-center rounded-full border-violet-600 border-2 bg-transparent py-2 px-10 text-violet-600 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30"
                    disabled={
                      !name ||
                      !description ||
                      !handle ||
                      !imageCid ||
                      (isVisibilityPrivate &&
                        isMembershipGated &&
                        !membershipTokenAddress)
                    }
                    onClick={() => {
                      setCurrentStep(2);
                      setTransactionRejected(false);
                    }}
                  >
                    choose apps &rarr;
                  </button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <button
                    onClick={(e) => setCurrentStep(1)}
                    className="mt-2 mr-4 text-violet-600 font-semibold underline"
                  >
                    back
                  </button>
                  <button
                    className=" inline-flex items-center rounded-full border-violet-600 border-2 bg-transparent py-2 px-10 text-violet-600 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30"
                    disabled={!apps.length}
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
              rel="noreferrer"
              href={`${blockchainExplorerUrl}/${tx}`}
              className="text-violet-600"
            >
              please following this link
            </a>
            .
          </>
        }
        footer={
          <button className="px-6 py-2.5 bg-violet-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-violet-600 hover:shadow-lg focus:bg-violet-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-violet-800 active:shadow-lg transition duration-150 ease-in-out">
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
