import { Router, useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { deleteProfile } from "../../../api/lens/deleteProfile";
import { setDefaultProfile } from "../../../api/lens/setDefaultProfile";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { Profile, PublicationMainFocus } from "../../../types/lens-generated";
import { Space } from "../../../types/space";
import "easymde/dist/easymde.min.css";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { SpaceSocial } from "../../../types/social";
import { uuid } from "uuidv4";
import { createPost } from "../../../api/lens/createPost";
import SocialPublications from "./SocialPublications";
import SocialProfile from "./SocialProfile";

enum PageState {
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
  const router = useRouter();
  const { appSocialsContract } = useAppContract();

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [pageState, setPageState] = useState(PageState.Publications);

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
  const [isLoading, setIsloading] = useState(false);
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
  const defaultProfile = useGetDefaultProfile({
    ethereumAddress: address, // socialDetails.lensWallet,
    // shouldSkip: !!socialDetails?.lensDefaultProfileId,
  });

  console.log("defaultProfile", defaultProfile);

  const { getPublications, data: publications } = useGetPublications({
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

  async function saveToIpfsAndCreatePost() {
    if (!post.title || !post.content || !post.coverImage) {
      return;
    }

    let ipfsResult: string;

    try {
      setIsloading(true);

      ipfsResult = (await saveToIpfs(
        {
          version: "2.0.0",
          mainContentFocus: PublicationMainFocus.TextOnly,
          metadata_id: uuid(),
          description: "Description",
          locale: "en-US",
          content: "Content",
          external_url: null,
          image: null,
          imageMimeType: null,
          name: "Name",
          attributes: [],
          tags: ["using_api_examples"],
          appId: "api_examples_github",
        },
        post.title,
      )) as string;

      console.log("create post: ipfs result", ipfsResult);
    } catch (err: any) {
      setIsloading(false);
      console.error(
        `An error occurred saving post data to IPFS, ${err.message}`,
      );
      return;
    }

    try {
      // hard coded to make the code example clear
      const createPostRequest = {
        profileId: defaultProfile?.id,
        contentURI: `ipfs://${ipfsResult}`,
        collectModule: {
          // feeCollectModule: {
          //   amount: {
          //     currency: currencies.enabledModuleCurrencies.map(
          //       (c: any) => c.address
          //     )[0],
          //     value: '0.000001',
          //   },
          //   recipient: address,
          //   referralFee: 10.5,
          // },
          // revertCollectModule: true,
          freeCollectModule: { followerOnly: true },
          // limitedFeeCollectModule: {
          //   amount: {
          //     currency: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
          //     value: '2',
          //   },
          //   collectLimit: '20000',
          //   recipient: '0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3',
          //   referralFee: 0,
          // },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      };

      await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

      createPost(createPostRequest);
    } catch (err: any) {
      console.error(`An error occurred creating the post on lens`);
    } finally {
      setIsloading(false);
    }
  }

  function showContent() {
    let content: ReactElement | null = null;

    switch (pageState) {
      case PageState.Publications:
        content = (
          <SocialPublications
            {...{
              isLensPublisher,
              setWritePost,
              writePost,
              PageState,
              setPageState,
              space,
              post,
              setPost,
              saveToIpfsAndCreatePost,
              publications,
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
              PageState,
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
              onSetDefaultLensProfile,
              getSocials,
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
