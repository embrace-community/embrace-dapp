import { Router } from "next/router";
import { useRef, useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { createProfile } from "../../../api/lens/createProfile";
import { deleteProfile } from "../../../api/lens/deleteProfile";
import { setDefaultProfile } from "../../../api/lens/setDefaultProfile";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetProfiles from "../../../hooks/lens/useGetProfiles";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import signInIfNotAuthenticated from "../../../lib/ApolloClient";
import { LocalStorageKey } from "../../../lib/enums";
import { Profile, Publication } from "../../../types/lens-generated";
import { Space } from "../../../types/space";
import Button from "../../Button";
import DropDown from "../../DropDown";
import Spinner from "../../Spinner";
import lensAuthentication from "./lensAuthentication";

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");

  const [isCreateProfileLoading, setIsCreateProfileLoading] = useState(false);

  const createdProfile = useRef("");

  const lensDefaultProfileId = space.loadedMetadata?.lensDefaultProfileId || "";
  const lensWallet: Address = space.loadedMetadata?.lensWallet || space.founder;

  const isLensPublisher = !address || address === lensWallet;

  const profiles = useGetProfiles({
    ownedBy: [lensWallet],
    shouldSkip: !isLensPublisher || !lensWallet,
  });

  // we're assuming for now that the publisher of the space has set
  // a default lens profile which he uses for publishing
  const defaultProfile = useGetDefaultProfile({
    ethereumAddress: lensWallet,
    shouldSkip: !space.loadedMetadata || !!lensDefaultProfileId,
  });

  const publications = useGetPublications({
    profileId:
      lensDefaultProfileId || defaultProfile?.id || createdProfile.current,
    // limit: 10,
    shouldSkip: !lensDefaultProfileId && !defaultProfile,
  });

  async function createLensProfile() {
    setIsCreateProfileLoading(true);
    try {
      await signInIfNotAuthenticated(lensWallet, signMessageAsync);

      const createdProfile = await createProfile({
        handle: profileName,
        profilePictureUri: "", // TODO: let user set profile picture?
      });

      if (!createdProfile) {
        throw new Error(
          `No create profile response from lens received. Please try to login again.`,
        );
      }

      await setDefaultProfile({ profileId: profileName });

      createdProfile.current = profileName;
    } catch (error) {
    } finally {
      setIsCreateProfileLoading(false);
    }
  }

  // publish new metadata if user has a new default Profile
  // useEffect(() => {
  // if(space.loadedMetadata && )
  // }, []);

  return (
    <div className="w-full">
      {isLensPublisher &&
        space.loadedMetadata &&
        !lensDefaultProfileId &&
        !defaultProfile && (
          <div>
            <div>No lens profile found, create here one.</div>

            <div className="flex items-center rounded-md mt-4">
              <input
                type="text"
                className="w-72 mr-4 block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
                placeholder="The name of your new lens profile"
                onChange={(e) => setProfileName(e.target.value)}
                value={profileName}
              />
              <Button
                additionalClassName="py-2 px-10"
                buttonProps={{
                  onClick: () => createLensProfile(),
                  disabled: !profileName || isCreateProfileLoading,
                }}
              >
                {isCreateProfileLoading ? <Spinner /> : "Create Profile"}
              </Button>
            </div>
          </div>
        )}

      {isLensPublisher && (
        <div className="flex justify-between">
          <DropDown
            title={selectedProfile ? selectedProfile.handle : "Select Profile"}
            items={profiles?.items?.map((profile: Profile) => {
              return <div key={profile.id}>{profile.handle}</div>;
            })}
            onSelectItem={(id) => {
              setSelectedProfile(
                profiles!.items.find(
                  (profile: Profile) => profile.id === id,
                ) as Profile,
              );
            }}
          />

          <div>
            <button
              className="border-red-500 text-red-500 border-2 rounded-md px-2 py-2"
              onClick={async () => {
                if (!selectedProfile) return;
                try {
                  await signInIfNotAuthenticated(lensWallet, signMessageAsync);
                  deleteProfile({ profileId: selectedProfile.id });
                } catch (e: any) {
                  console.error(
                    `An error occured deleting the profile. Please try again: ${e.message}`,
                  );
                }
              }}
            >
              Delete Profile
            </button>
            <button
              className="ml-4 border-2 rounded-md px-2 py-2"
              onClick={async () => {
                if (!selectedProfile) return;

                try {
                  await signInIfNotAuthenticated(lensWallet, signMessageAsync);
                  setDefaultProfile({ profileId: selectedProfile.id });
                } catch (e: any) {
                  console.error(
                    `An error occured selecting the default profile. Please try again: ${e.message}`,
                  );
                }
              }}
            >
              Set To Default Profile
            </button>
          </div>
        </div>
      )}

      <h3 className="mt-10">Posts</h3>
      {publications?.items?.map((item: Publication) => {
        return (
          <div
            key={item.id}
            className="rounded-lg border-gray-400 border-2 mt-2"
          >
            {item.metadata?.name} -{" "}
            {item?.createdAt && new Date(item.createdAt).toLocaleString()}
          </div>
        );
      })}
    </div>
  );
}
