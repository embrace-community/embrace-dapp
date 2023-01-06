import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { PageState } from ".";
import { createProfile } from "../../../api/lens/createProfile";
import { setDefaultProfile } from "../../../api/lens/setDefaultProfile";
import useGetProfiles from "../../../hooks/lens/useGetProfiles";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { Profile } from "../../../types/lens-generated";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import DropDown from "../../DropDown";
import Spinner from "../../Spinner";

export default function SocialProfile({
  setPageState,
  space,
  socialDetails,
  lensWallet,
  setLensWallet,
  lensProfile,
  setLensProfile,
  defaultProfile,
  setProfileName,
  profileName,
  selectedProfile,
  setSelectedProfile,
  onDeleteLensProfile,
  getSocials,
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { appSocialsContract } = useAppContract();

  const [isLoading, setIsloading] = useState(false);

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
      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

      const createdProfileTx = await createProfile({
        handle: profileName,
        profilePictureUri: "", // TODO: let user set profile picture?
      });

      if (!createdProfileTx) {
        throw new Error(
          `No create profile response from lens received. Please try to login again.`,
        );
      }

      getProfiles();
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

      getSocials();
    } catch (e: any) {
      console.error(
        `An error occurred setting the profiles for lens ${e.message}`,
      );
    } finally {
      setIsloading(false);
    }
  }

  async function onSetDefaultLensProfile() {
    if (!selectedProfile) return;

    try {
      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);
      setDefaultProfile({
        profileId: selectedProfile.id,
      });
    } catch (e: any) {
      console.error(
        `An error occured selecting the default profile. Please try again: ${e.message}`,
      );
    }
  }

  const isLensPublisher =
    socialDetails?.lensWallet && address === socialDetails?.lensWallet;

  return (
    <>
      <button
        className="rounded-full float-right border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold p-2 flex flex-row items-center"
        onClick={() => {
          setPageState({ type: PageState.Publications, data: "" });
        }}
      >
        <ArrowUturnLeftIcon width={24} height={24} />
      </button>

      {isLensPublisher || address === space.founder ? (
        <>
          <div>
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
          </div>

          <div className="mt-8">
            <h3 className="text-xl">Lens profile management</h3>

            <h4 className="text-md mt-4">Current default profile</h4>
            <input
              type="text"
              className="mt-2 w-72 block bg-transparent text-gray-400 rounded-md border-embrace-dark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
              value={`${defaultProfile?.handle} - ${defaultProfile?.id}`}
              disabled
            />

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
        <div>You are not a publisher for this space</div>
      )}
    </>
  );
}
