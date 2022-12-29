import React from "react";
import { useAccount } from "wagmi";
import { Profile } from "../../../types/lens-generated";
import Button from "../../Button";
import DropDown from "../../DropDown";
import Spinner from "../../Spinner";

export default function SocialProfile({
  isLensPublisher,
  setPageState,
  PageState,
  space,
  socialDetails,
  lensWallet,
  setLensWallet,
  lensProfile,
  setLensProfile,
  onSetLensProfile,
  isLoading,
  defaultProfile,
  setProfileName,
  profileName,
  createLensProfile,
  selectedProfile,
  profiles,
  setSelectedProfile,
  onDeleteLensProfile,
  onSetDefaultLensProfile,
}) {
  const { address } = useAccount();

  return (
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
}
