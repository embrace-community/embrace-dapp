import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import {
  DefaultProfileRequest,
  DefaultProfileQuery,
} from "../../types/lens-generated";

function useGetDefaultProfile(
  reqParams: DefaultProfileRequest & { shouldSkip?: boolean } = {
    ethereumAddress: "",
    shouldSkip: false,
  },
) {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

  const shouldSkipCallApi =
    !address ||
    !isConnected ||
    isConnecting ||
    isDisconnected ||
    reqParams?.shouldSkip;

  delete reqParams.shouldSkip;

  const request: DefaultProfileRequest = reqParams;
  if (!request.ethereumAddress) request.ethereumAddress = address;

  const result = useQuery<
    DefaultProfileQuery,
    { request: DefaultProfileRequest }
  >(GET_DEFAULT_PROFILE, {
    variables: { request },
    context: { clientName: "lens" },
    skip: shouldSkipCallApi,
  });

  const profile = result?.data?.defaultProfile;

  return profile as DefaultProfileQuery | undefined;
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
