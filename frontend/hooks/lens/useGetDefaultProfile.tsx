import { gql, useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import {
  DefaultProfileRequest,
  DefaultProfileQuery,
  Profile,
} from "../../types/lens-generated";

function useGetDefaultProfile(
  reqParams: DefaultProfileRequest & { shouldSkip?: boolean } = {
    ethereumAddress: "",
    shouldSkip: false,
  },
) {
  const request: DefaultProfileRequest = reqParams;

  const [getDefaultProfile, defaultProfileProps] = useLazyQuery<
    DefaultProfileQuery,
    { request: DefaultProfileRequest }
  >(GET_DEFAULT_PROFILE, {
    variables: { request },
    context: { clientName: "lens" },
  });

  useEffect(() => {
    getDefaultProfile();
  }, [getDefaultProfile]);

  return {
    getDefaultProfile,
    ...defaultProfileProps,
    defaultProfile: defaultProfileProps?.data?.defaultProfile as
      | Profile
      | undefined,
  };
}

const GET_DEFAULT_PROFILE = gql`
  query DefaultProfile($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
      name
      bio
      isDefault
      attributes {
        displayType
        traitType
        key
        value
      }
      followNftAddress
      metadata
      handle
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          chainId
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
      }
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          chainId
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
      }
      ownedBy
      dispatcher {
        address
        canUseRelay
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          contractAddress
          amount {
            asset {
              name
              symbol
              decimals
              address
            }
            value
          }
          recipient
        }
        ... on ProfileFollowModuleSettings {
          type
        }
        ... on RevertFollowModuleSettings {
          type
        }
      }
    }
  }
`;

export default useGetDefaultProfile;
