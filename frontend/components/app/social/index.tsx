import dynamic from "next/dynamic";
import { Router, useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { createProfile } from "../../../api/lens/createProfile";
import { deleteProfile } from "../../../api/lens/deleteProfile";
import { setDefaultProfile } from "../../../api/lens/setDefaultProfile";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetProfiles from "../../../hooks/lens/useGetProfiles";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { Profile, Publication } from "../../../types/lens-generated";
import { Space } from "../../../types/space";
import Button from "../../Button";
import DropDown from "../../DropDown";
import Spinner from "../../Spinner";
import "easymde/dist/easymde.min.css";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import useEmbraceContracts, {
  useAppContract,
} from "../../../hooks/useEmbraceContracts";
import { SpaceSocial } from "../../../types/social";
import { ethers } from "ethers";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

enum PageState {
  Publications = "publications",
  Profile = "profile",
}

const postInitialState = { title: "", content: "", coverImage: "" };

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const router = useRouter();
  const { appSocialsContract } = useAppContract();

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [pageState, setPageState] = useState(PageState.Publications);

  // profile management
  const [lensWallet, setLensWallet] = useState("");
  const [lensProfile, setLensProfile] = useState("");

  // const [currentPage, setCurrentPage] = useState(1);
  const [profileName, setProfileName] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // publication management
  const [writePost, setWritePost] = useState(false);
  const [post, setPost] = useState(postInitialState);
  const [postError, setPostError] = useState({
    title: false,
    content: false,
    erc20EncryptToken: false,
  });

  // general
  const [isLoading, setIsloading] = useState(false);
  const [socialDetails, setSocialDetails] = useState<SpaceSocial>();

  useEffect(() => {
    appSocialsContract
      ?.getSocial(space.id)
      ?.then((socials) => setSocialDetails(socials))
      ?.catch((e: any) =>
        console.error(
          `An error occurred fetchin the socials contract, ${e.message}`,
        ),
      );
  }, [appSocialsContract, space.id]);

  const createdProfile = useRef("");

  const isLensPublisher =
    socialDetails?.lensWallet && address === socialDetails?.lensWallet;

  const ownedBy = [address];
  if (
    socialDetails?.lensWallet &&
    socialDetails?.lensWallet !== ethers.constants.AddressZero &&
    socialDetails?.lensWallet !== address
  ) {
    ownedBy.push(socialDetails.lensWallet as Address);
  }
  const profiles = useGetProfiles({
    ownedBy,
    shouldSkip: !isLensPublisher && address !== space.founder,
  });

  console.log("profiles", profiles);

  // we're assuming for now that the publisher of the space has set
  // a default lens profile which he uses for publishing
  const defaultProfile = useGetDefaultProfile({
    ethereumAddress: address, // socialDetails.lensWallet,
    // shouldSkip: !!socialDetails?.lensDefaultProfileId,
  });

  console.log("defaultProfile", defaultProfile);

  const publications = useGetPublications({
    profileId:
      socialDetails?.lensDefaultProfileId ||
      defaultProfile?.id ||
      createdProfile.current,
    // limit: 10,
    shouldSkip: !socialDetails?.lensDefaultProfileId && !defaultProfile,
  });

  async function createLensProfile() {
    setIsloading(true);

    try {
      await lensAuthenticationIfNeeded(
        socialDetails?.lensWallet as Address,
        signMessageAsync,
      );

      const createdProfileTx = await createProfile({
        handle: profileName,
        profilePictureUri: "", // TODO: let user set profile picture?
      });

      if (!createdProfileTx) {
        throw new Error(
          `No create profile response from lens received. Please try to login again.`,
        );
      }

      // TODO: Find a way to refresh profile data
      router.reload();
    } catch (error: any) {
      console.error(
        `An error occured while creating the lense profile. Please try again: ${error.message}`,
      );
    } finally {
      setIsloading(false);
    }
  }

  async function onSetLensProfile() {
    if (!lensWallet || !lensProfile || address !== space.founder) {
      return;
    }

    try {
      setIsloading(true);

      await appSocialsContract?.createSocial(space.id, lensWallet, lensProfile);

      console.log(`Successfully set the lens profiles`);

      // TODO: Find a way to refresh profile data
      router.reload();
    } catch (e: any) {
      console.error(
        `An error occurred setting the profiles for lens ${e.message}`,
      );
    } finally {
      setIsloading(false);
    }
  }

  async function onDeleteLensProfile() {
    if (!selectedProfile) return;

    try {
      await lensAuthenticationIfNeeded(
        socialDetails?.lensWallet as Address,
        signMessageAsync,
      );
      deleteProfile({ profileId: selectedProfile.id });
    } catch (e: any) {
      console.error(
        `An error occured deleting the profile. Please try again: ${e.message}`,
      );
    }
  }

  async function onSetDefaultLensProfile() {
    if (!selectedProfile) return;

    try {
      await lensAuthenticationIfNeeded(
        socialDetails?.lensWallet as Address,
        signMessageAsync,
      );
      setDefaultProfile({
        profileId: selectedProfile.id,
      });
    } catch (e: any) {
      console.error(
        `An error occured selecting the default profile. Please try again: ${e.message}`,
      );
    }
  }

  async function createPost() {
    // const ipfsResult = await saveToIpfs({
    //   version: "2.0.0",
    //   mainContentFocus: PublicationMainFocus.TEXT_ONLY,
    //   metadata_id: uuidv4(),
    //   description: "Description",
    //   locale: "en-US",
    //   content: "Content",
    //   external_url: null,
    //   image: null,
    //   imageMimeType: null,
    //   name: "Name",
    //   attributes: [],
    //   tags: ["using_api_examples"],
    //   appId: "api_examples_github",
    // });
    // console.log("create post: ipfs result", ipfsResult);
    // // hard coded to make the code example clear
    // const createPostRequest = {
    //   profileId: defaultProfile?.id,
    //   contentURI: `ipfs://${ipfsResult.path}`,
    //   collectModule: {
    //     // feeCollectModule: {
    //     //   amount: {
    //     //     currency: currencies.enabledModuleCurrencies.map(
    //     //       (c: any) => c.address
    //     //     )[0],
    //     //     value: '0.000001',
    //     //   },
    //     //   recipient: address,
    //     //   referralFee: 10.5,
    //     // },
    //     // revertCollectModule: true,
    //     freeCollectModule: { followerOnly: true },
    //     // limitedFeeCollectModule: {
    //     //   amount: {
    //     //     currency: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    //     //     value: '2',
    //     //   },
    //     //   collectLimit: '20000',
    //     //   recipient: '0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3',
    //     //   referralFee: 0,
    //     // },
    //   },
    //   referenceModule: {
    //     followerOnlyReferenceModule: false,
    //   },
    // };
  }

  // publish new metadata if user has a new default Profile
  // useEffect(() => {
  // if(space.loadedMetadata && )
  // }, []);

  function showContent() {
    let content: ReactElement | null = null;

    switch (pageState) {
      case PageState.Publications:
        content = (
          <>
            <div className="flex justify-between">
              {isLensPublisher && (
                <Button
                  additionalClassName="p-2"
                  buttonProps={{
                    onClick: () => {
                      setWritePost((prevState) => !prevState);
                    },
                  }}
                >
                  {writePost ? "Hide Post" : "Write Post"}
                </Button>
              )}

              {(isLensPublisher || address === space.founder) && (
                <Button
                  additionalClassName="p-2 ml-auto"
                  buttonProps={{
                    onClick: () => setPageState(PageState.Profile),
                  }}
                >
                  Manage Profile
                </Button>
              )}
            </div>

            {isLensPublisher && writePost && (
              <div className="mt-4">
                <SimpleMDE
                  placeholder="What's on your mind?"
                  value={post.content}
                  onChange={(value: string) =>
                    setPost({ ...post, content: value })
                  }
                />
              </div>
            )}

            <div className="mt-8">
              <h3>Posts</h3>

              <div className="mt-6">
                {publications?.items?.length === 0 && (
                  <div>No posts so far...</div>
                )}

                {publications?.items?.map((item: Publication) => {
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border-gray-400 border-2 mt-2"
                    >
                      {item.metadata?.name} -{" "}
                      {item?.createdAt &&
                        new Date(item.createdAt).toLocaleString()}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
        break;

      case PageState.Profile:
        content = (
          <>
            <Button
              additionalClassName="p-2 float-right"
              buttonProps={{
                onClick: () => setPageState(PageState.Publications),
              }}
            >
              See Publications
            </Button>

            {isLensPublisher || address === space.founder ? (
              <>
                <div>
                  <h3 className="text-xl">Set Social Default Profiles</h3>

                  <input
                    type="text"
                    className="mt-2 w-1/2 block rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
                    placeholder={
                      socialDetails?.lensWallet
                        ? socialDetails?.lensWallet
                        : "Wallet Address"
                    }
                    value={lensWallet}
                    onChange={(e) => setLensWallet(e.target.value)}
                  />

                  <input
                    type="text"
                    className="mt-2 w-1/2 block rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
                    placeholder={
                      socialDetails?.lensDefaultProfileId
                        ? socialDetails?.lensDefaultProfileId
                        : "Lens Profile Id (0x...)"
                    }
                    value={lensProfile}
                    onChange={(e) => setLensProfile(e.target.value)}
                  />

                  <button
                    className="mt-4 min-w-[10rem] block border-violet-600 text-violet-600 disabled:opacity-20 border-2 rounded-md px-2 py-2"
                    onClick={onSetLensProfile}
                    disabled={!lensProfile || !lensWallet}
                  >
                    {isLoading ? <Spinner /> : "Submit Lens Profiles"}
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl">Lens profile management</h3>

                  <h4 className="text-md mt-4">Current default profile</h4>
                  <input
                    type="text"
                    className="mt-2 w-72 block bg-transparent text-gray-400 rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                    value={`${defaultProfile?.handle} - ${defaultProfile?.id}`}
                    disabled
                  />

                  <div className="mt-4">
                    <h4 className="text-md">Create new profile</h4>
                    <div className="flex items-center rounded-md">
                      <input
                        type="text"
                        className="w-72 block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                        placeholder="The name of your new lens profile"
                        onChange={(e) => setProfileName(e.target.value)}
                        value={profileName}
                      />
                      <button
                        className="ml-4 min-w-[10rem] border-violet-600 text-violet-600 disabled:opacity-20  border-2 rounded-md px-2 py-2"
                        onClick={() => createLensProfile()}
                        disabled={!profileName || isLoading}
                      >
                        {isLoading ? <Spinner /> : "Create Profile"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md">Modify existing profiles</h4>
                    <div className="mt-2 flex items-center">
                      <DropDown
                        title={
                          selectedProfile
                            ? `${selectedProfile.handle} - ${selectedProfile.id}`
                            : "Select Profile"
                        }
                        items={profiles?.items?.map((profile: Profile) => {
                          return (
                            <div
                              key={profile.id}
                            >{`${profile.handle} - ${profile.id}`}</div>
                          );
                        })}
                        onSelectItem={(id) => {
                          setSelectedProfile(
                            profiles?.items.find(
                              (profile: Profile) => profile.id === id,
                            ) as Profile,
                          );
                        }}
                      />

                      <div className="ml-4">
                        <button
                          className="border-red-500 text-red-500 disabled:opacity-20 border-2 rounded-md px-2 py-2"
                          onClick={onDeleteLensProfile}
                          disabled={!selectedProfile}
                        >
                          Delete Profile
                        </button>
                        <button
                          className="ml-4 border-violet-600 text-violet-600 disabled:opacity-20  border-2 rounded-md px-2 py-2"
                          onClick={onSetDefaultLensProfile}
                          disabled={!selectedProfile}
                        >
                          Set To Default Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>You are no publisher for this space</div>
            )}
          </>
        );
        break;
      default:
        break;
    }

    return content;
  }

  return <div className="w-full">{showContent()}</div>;
}
