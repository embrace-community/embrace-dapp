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
import useSigner from "../../../hooks/useSigner";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { removeProperty } from "../../../lib/web3storage/object";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import { Profile, PublicationMainFocus } from "../../../types/lens-generated";
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
  const { signer } = useSigner();

  const { chain } = useNetwork();
  const {
    chains,
    error,
    isLoading: switchLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const { signMessageAsync } = useSignMessage();
  const { lensHubContract } = useLensContracts();

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

  async function createLensPublication() {
    setIsLoading(true);

    if (!signer) {
      console.error("No signer found");
      return;
    }

    try {
      await lensAuthenticationIfNeeded(lensWallet as Address, signMessageAsync);

      const uuid = uuidv4();
      const filename = `${defaultProfile?.handle}_${uuid}`;
      const tags = ["test"];

      const post = {
        version: "2.0.0",
        mainContentFocus: PublicationMainFocus.TextOnly,
        metadata_id: uuid,
        description: "Description",
        locale: "en-US",
        content: "Content",
        external_url: null,
        image: null,
        imageMimeType: null,
        name: "Name",
        attributes: [],
        tags,
        appId: "embrace_community",
      };

      const ipfsResult = await saveToIpfs(post, filename);

      console.log("create post ipfs result", ipfsResult);

      const createPostRequest = {
        profileId: defaultProfile?.id,
        contentURI: `ipfs://${ipfsResult}`,
        collectModule: { freeCollectModule: { followerOnly: true } },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      };

      const createdPost = await createPost(createPostRequest);

      console.log("created post", createdPost);

      const removedProperties = removeProperty(createdPost, "__typename");

      console.log("removedProperties", removedProperties);
      const { domain, types, value } = removedProperties.typedData;

      if (chain?.id !== 80001) {
        console.log("switch start");
        await switchNetwork!(80001);
        console.log("switch end");
      }
      console.log("signing");

      // how to go from here?
      // const signature = await signer._signTypedData(domain, types, value);

      // console.log("signature", signature);

      // const { v, r, s } = ethers.utils.splitSignature(signature);

      // console.log("signature", v, r, s);

      // const tx = await lensHubContract!.postWithSig({
      //   profileId: value.profileId,
      //   contentURI: value.contentURI,
      //   collectModule: value.collectModule,
      //   collectModuleInitData: value.collectModuleInitData,
      //   referenceModule: value.referenceModule,
      //   referenceModuleInitData: value.referenceModuleInitData,
      //   sig: { v, r, s, deadline: value.deadline },
      // });
      // console.log("create post: tx hash", tx.hash);
    } catch (error: any) {
      console.log("An error occurred create a post: ", error?.message);
    } finally {
      setIsLoading(false);
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

      case PageState.PublicationDetail:
        content = (
          <SocialPublicationDetail
            {...{
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
