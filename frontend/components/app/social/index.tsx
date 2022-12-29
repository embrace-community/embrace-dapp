import "easymde/dist/easymde.min.css";
import { Router } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { deleteProfile } from "../../../api/lens/deleteProfile";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { Profile } from "../../../types/lens-generated";
import { SpaceSocial } from "../../../types/social";
import { Space } from "../../../types/space";
import SocialProfile from "./SocialProfile";
import SocialPublicationDetail from "./SocialPublicationDetail";
import SocialPublications from "./SocialPublications";

export enum PageState {
  Publications = "publications",
  Profile = "profile",
  PublicationDetail = "publication_detail",
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

  const isLensPublisher =
    socialDetails?.lensWallet && address === socialDetails?.lensWallet;

  // we're assuming for now that the publisher of the space has set
  // a default lens profile which he uses for publishing
  const { defaultProfile } = useGetDefaultProfile({ ethereumAddress: address });
  console.log("defaultProfile", defaultProfile);

  const { getPublications, publications } = useGetPublications({
    profileId: socialDetails?.lensDefaultProfileId,
    // limit: 10,
  });

  async function onDeleteLensProfile() {
    if (!selectedProfile) return;

    try {
      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);
      deleteProfile({ profileId: selectedProfile.id });
    } catch (e: any) {
      console.error(
        `An error occured deleting the profile. Please try again: ${e.message}`,
      );
    }
  }

  console.log("publications", publications);

  function showContent() {
    let content: ReactElement | null = null;

    switch (pageState.type) {
      case PageState.Publications:
        content = (
          <SocialPublications
            {...{
              isLensPublisher,
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
              isLensPublisher,
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
            }}
          />
        );
        break;

      case PageState.PublicationDetail:
        content = (
          <SocialPublicationDetail
            {...{
              pageState,
              setPageState,
              publication: publications?.items?.find(
                (publication) => publication.id === pageState.data,
              ),
            }}
          />
        );
        break;
      default:
        break;
    }

    return content;
  }

  return <div className="w-full">{showContent()}</div>;
}
