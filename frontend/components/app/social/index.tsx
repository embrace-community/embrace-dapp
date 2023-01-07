import "easymde/dist/easymde.min.css";
import { Router } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { SpaceSocial } from "../../../types/social";
import { Space } from "../../../types/space";
import SocialProfile from "./SocialProfile";
import SocialPublications from "./SocialPublications";

export enum PageState {
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
  const { appSocialsContract } = useAppContract();
  const { address } = useAccount();

  const { signMessageAsync } = useSignMessage();

  const [pageState, setPageState] = useState({
    type: PageState.Publications,
    data: "",
  });

  // profile management
  const [lensWallet, setLensWallet] = useState("");
  const [lensProfile, setLensProfile] = useState("");

  const [profileName, setProfileName] = useState("");

  // publication management
  const [writePost, setWritePost] = useState(false);
  const [post, setPost] = useState(postInitialState);

  // general
  const [socialDetails, setSocialDetails] = useState<SpaceSocial>();

  const getSocials = useCallback(() => {
    appSocialsContract
      ?.getSocial(space.id)
      ?.then((socials) => setSocialDetails(socials as SpaceSocial))
      ?.catch((e: any) =>
        console.error(
          `An error occurred fetchin the socials contract, ${e.message}`,
        ),
      );
  }, [appSocialsContract, space.id]);

  useEffect(() => {
    getSocials();
  }, [getSocials]);

  // we're assuming for now that the publisher of the space has set
  // a default lens profile which he uses for publishing
  const { defaultProfile, getDefaultProfile } = useGetDefaultProfile({
    ethereumAddress: address,
  });

  const { publications, getPublications } = useGetPublications({
    profileId: socialDetails?.lensDefaultProfileId,
    // limit: 10,
  });

  function showContent() {
    let content: ReactElement | null = null;

    switch (pageState.type) {
      case PageState.Publications:
        content = (
          <SocialPublications
            {...{
              socialDetails,
              setWritePost,
              writePost,
              setPageState,
              space,
              post,
              setPost,
              publications,
              defaultProfile,
            }}
          />
        );
        break;

      case PageState.Profile:
        content = (
          <SocialProfile
            {...{
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
              getSocials,
            }}
          />
        );
        break;
    }

    return content;
  }

  return <div className="w-full">{showContent()}</div>;
}
