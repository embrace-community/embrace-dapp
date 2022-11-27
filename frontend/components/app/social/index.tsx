import { Router } from "next/router";
import { useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import { LocalStorageKey } from "../../../lib/enums";
import { Publication } from "../../../types/lens-generated";
import { Space } from "../../../types/space";
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
  const [profileName, setProfileName] = useState("");

  const lensDefaultProfile = space.loadedMetadata?.lensDefaultProfile || "";
  const lensWallet: Address = space.loadedMetadata?.lensWallet || space.founder;

  // we're assuming for now that the publisher of the space has set
  // a default lens profile which he uses for publishing
  const defaultProfile = useGetDefaultProfile({
    ethereumAddress: lensWallet,
    shouldSkip: !!lensDefaultProfile,
  });

  const publications = useGetPublications({
    profileId: lensDefaultProfile || defaultProfile,
    // profileId: "0xac",
    // limit: 10,
    shouldSkip: !lensDefaultProfile && !defaultProfile,
  });

  async function createLensProfile() {
    const lensAccessKey = localStorage.getItem(LocalStorageKey.LensAccessToken);

    if (!lensAccessKey) {
      const authentication = await lensAuthentication({
        address: lensWallet,
        signMessageAsync,
      });
    }
  }

  // publish new metadata if user has a new default Profile
  // useEffect(() => {
  // if(space.loadedMetadata && )
  // }, []);

  return (
    <div>
      {address === lensWallet && !defaultProfile && (
        <div>
          <input onChange={(e) => setProfileName(e.target.value)} />
          <button onClick={() => createLensProfile()}>Create Profile</button>
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
