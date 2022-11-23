import { Router } from "next/router";
import { useState } from "react";
import useGetPublications from "../../../hooks/app/chat/useGetPublications";
import useGetProfiles from "../../../hooks/app/chat/useProfiles";
import { Profile, Publication } from "../../../types/lens-generated";
import { Space } from "../../../types/space";
import DropDown from "../../DropDown";

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const profiles = useGetProfiles({
    ownedBy: ["0x806346b423dDB4727C1f5dC718886430aA7CE9cF"],
  });
  const publications = useGetPublications({
    profileId: "0xac", // selectedProfile?.id,
    // limit: 10,
  });

  return (
    <div>
      <DropDown
        title={<div>Please select your profile</div>}
        items={profiles?.items?.map((item: Profile) => {
          return (
            <span key={item.id}>
              {item.name}, {item.handle}
            </span>
          );
        })}
        onSelectItem={(profile) => setSelectedProfile(profile)}
      />

      <h3 className="mt-10">Posts</h3>
      {publications?.items?.map((item: Publication) => {
        return (
          <div className="rounded-lg border-gray-400 border-2 mt-2">
            {item.metadata?.name} -{" "}
            {item?.createdAt && new Date(item.createdAt).toLocaleString()}
          </div>
        );
      })}
    </div>
  );
}
