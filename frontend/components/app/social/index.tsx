import "easymde/dist/easymde.min.css";
import { ethers } from "ethers";
import { Router } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Address,
  useAccount,
  useNetwork,
  useSignMessage,
  useSwitchNetwork,
} from "wagmi";
import { createPost } from "../../../api/lens/createPost";
import { deleteProfile } from "../../../api/lens/deleteProfile";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import useLensContracts from "../../../hooks/lens/useLensContracts";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { useSigner } from "wagmi";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { removeProperty } from "../../../lib/web3storage/object";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import { Profile, PublicationMainFocus } from "../../../types/lens-generated";
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

  const { chain } = useNetwork();
  const {
    chains,
    error,
    isLoading: switchLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

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
  const [isLoading, setIsLoading] = useState(false);

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
  const { defaultProfile, getDefaultProfile } = useGetDefaultProfile({
    ethereumAddress: address,
  });

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

  // publish new metadata if user has a new default Profile
  // useEffect(() => {
  // if(space.loadedMetadata && )
  // }, []);

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
    }

    return content;
  }

  return <div className="w-full">{showContent()}</div>;
}
