import {
  ArrowUturnLeftIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { ethers } from "ethers";
import { ReactElement, useEffect, useState } from "react";
import {
  Address,
  useAccount,
  useProvider,
  useSignMessage,
  useSignTypedData,
} from "wagmi";
import { PageState } from ".";
import useGetProfiles from "../../../hooks/lens/useGetProfiles";
import useLensContracts from "../../../hooks/lens/useLensContracts";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { Profile } from "../../../types/lens-generated";
import DropDown from "../../DropDown";
import Spinner from "../../Spinner";
import {
  burnLensProfileAndPoll,
  createLensProfileAndPoll,
  setDefaultProfileAndPoll,
} from "./profile_utils";

enum ProfileState {
  NewLensProfile = "new_lens_profile",
  SetupSocialsContract = "setup_socials_contract",
}

export default function SocialProfile({
  setPageState,
  space,
  socialDetails,
  defaultProfile,
  initLoadedDefaultProfile,
  getSocials,
  getDefaultProfile,
}) {
  const { address } = useAccount();
  const provider = useProvider();

  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData({
    onError: (error) => {
      console.log(error);
    },
  });

  const { appSocialsContract } = useAppContract();
  const { lensHubContract } = useLensContracts();

  const [profileState, setProfileState] = useState<ProfileState>(
    ProfileState.SetupSocialsContract,
  );

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");

  const [lensWallet, setLensWallet] = useState("");
  const [lensProfile, setLensProfile] = useState("");

  const [isLoading, setIsloading] = useState(false);

  const isLensPublisher =
    socialDetails?.lensWallet && address === socialDetails?.lensWallet;

  const noLensSetup = socialDetails && !socialDetails.lensDefaultProfileId;

  const ownedBy = [address];
  if (
    socialDetails?.lensWallet &&
    socialDetails?.lensWallet !== ethers.constants.AddressZero &&
    socialDetails?.lensWallet !== address
  ) {
    ownedBy.push(socialDetails.lensWallet as Address);
  }
  const { getProfiles, profiles } = useGetProfiles({ ownedBy });

  async function createLensProfile() {
    setIsloading(true);

    try {
      await createLensProfileAndPoll({
        address,
        signMessageAsync,
        profileName,
      });

      const newProfiles = await getProfiles();

      const lastCreatedProfile = newProfiles.data?.profiles?.items?.find(
        (profile) => profile.handle === profileName,
      );

      if (lastCreatedProfile) {
        // TODO: Doesn't work currently as the indexer doesn't update the routes
        // fast enough
        await onSetDefaultLensProfile(lastCreatedProfile?.id);
        setPageState({ type: PageState.Publications, data: "" });
        return;
      }

      setProfileState(ProfileState.SetupSocialsContract);
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

      console.log(`Successfully set the lens profile on the contract`);

      if (!defaultProfile || defaultProfile?.id !== lensProfile) {
        await onSetDefaultLensProfile(lensProfile);
      }

      getSocials();

      setPageState({ type: PageState.Publications, data: "" });
    } catch (e: any) {
      console.error(
        `An error occurred setting the profiles for lens ${e.message}`,
      );
    } finally {
      setIsloading(false);
    }
  }

  async function onSetDefaultLensProfile(autoProfileId?: string) {
    if (!autoProfileId || !selectedProfile) return;

    try {
      console.log(
        `Setting default Profile to ${autoProfileId || selectedProfile.id}`,
      );
      const profileId = autoProfileId ? autoProfileId : selectedProfile.id;

      await setDefaultProfileAndPoll({
        lensAuthenticationIfNeeded,
        address,
        profileId,
        signMessageAsync,
        signTypedDataAsync,
        lensHubContract,
      });

      getDefaultProfile();
    } catch (e: any) {
      console.error(
        `An error occured selecting the default profile. Please try again: ${e.message}`,
      );
    }
  }

  async function onDeleteLensProfile() {
    if (!selectedProfile) return;

    try {
      await burnLensProfileAndPoll({
        address,
        signMessageAsync,
        selectedProfile,
        signTypedDataAsync,
        lensHubContract,
      });

      getProfiles();
    } catch (e: any) {
      console.error(
        `An error occured deleting the profile. Please try again: ${e.message}`,
      );
    }
  }

  useEffect(() => {
    // user has to create lens profile first
    if (initLoadedDefaultProfile && noLensSetup) {
      setProfileState(ProfileState.NewLensProfile);
    }
  }, [initLoadedDefaultProfile, noLensSetup]);

  function showContent() {
    let content: ReactElement;

    switch (profileState) {
      case ProfileState.NewLensProfile:
        content = (
          <div className="mt-4">
            <h3 className="text-xl">Lens profile management</h3>

            {/* <h4 className="text-md mt-4">Current default profile</h4>
            <input
              type="text"
              className="mt-2 w-72 block bg-transparent text-gray-400 rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
              value={`${defaultProfile?.handle} - ${defaultProfile?.id}`}
              disabled
            /> */}

            <div className="mt-4">
              <h4 className="text-md">Create new profile</h4>
              <div className="flex items-center rounded-md">
                <input
                  type="text"
                  className="w-72 block bg-transparent text-embrace-dark rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
                  placeholder="The name of your new lens profile"
                  onChange={(e) => setProfileName(e.target.value)}
                  value={profileName}
                />

                <button
                  className="ml-4 min-w-[10rem] border-violet-600 text-violet-600 disabled:opacity-20 border-2 rounded-md px-2 py-2"
                  onClick={() => createLensProfile()}
                  disabled={!profileName || isLoading}
                >
                  {isLoading ? <Spinner /> : "Create Profile"}
                </button>
              </div>

              <button
                className="min-w-[10rem] underline rounded-md px-2 py-2"
                onClick={() =>
                  setProfileState(ProfileState.SetupSocialsContract)
                }
              >
                Already have a Lens Profile?
              </button>
            </div>
          </div>
        );
        break;

      case ProfileState.SetupSocialsContract:
        content = (
          <div className="mt-4">
            <h3 className="text-xl">Set Social Default Profiles</h3>

            <input
              type="text"
              className="mt-2 w-1/2 block rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
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
              className="mt-2 w-1/2 block rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm"
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

            <div className="mt-4">
              <h4 className="text-md">Existing profiles</h4>
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
                    const profile = profiles?.items.find(
                      (profile: Profile) => profile.id === id,
                    ) as Profile;

                    setSelectedProfile(profile);
                    setLensWallet(address as string);
                    setLensProfile(profile.id);
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
                    onClick={() => onSetDefaultLensProfile()}
                    disabled={!selectedProfile}
                  >
                    Set To Default Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      default:
        content = <></>;
        break;
    }

    return content;
  }

  const showProfileOptions = isLensPublisher || address === space.founder;

  return (
    <>
      <div
        className={classNames("flex", {
          "justify-between": showProfileOptions,
          "justify-end": !showProfileOptions,
        })}
      >
        {showProfileOptions && (
          <button
            className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
            onClick={() => {
              setProfileState(
                profileState === ProfileState.NewLensProfile
                  ? ProfileState.SetupSocialsContract
                  : ProfileState.NewLensProfile,
              );
            }}
          >
            {profileState === ProfileState.NewLensProfile ? (
              <ClipboardDocumentListIcon width={24} height={24} />
            ) : (
              <UserCircleIcon width={24} height={24} />
            )}
          </button>
        )}

        <button
          className="rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
          onClick={() => {
            setPageState({ type: PageState.Publications, data: "" });
          }}
        >
          <ArrowUturnLeftIcon width={24} height={24} />
        </button>
      </div>

      {isLensPublisher || address === space.founder ? (
        showContent()
      ) : (
        <div>You are not a publisher for this space</div>
      )}
    </>
  );
}
