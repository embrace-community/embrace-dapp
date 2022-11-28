import { gql, useQuery } from "@apollo/client";
import {
  PaginatedProfileResult,
  ProfileQueryRequest,
  ProfilesQuery,
} from "../../types/lens-generated";

function useGetProfiles(
  request: ProfileQueryRequest & { shouldSkip?: boolean } = {
    shouldSkip: false,
  },
) {
  const shouldSkipCallApi = !request.ownedBy || request.shouldSkip;

  delete request.shouldSkip;

  const result = useQuery<ProfilesQuery, { request: ProfileQueryRequest }>(
    GET_PROFILES,
    {
      variables: { request },
      context: { clientName: "lens" },
      skip: shouldSkipCallApi,
    },
  );

  const profiles = result?.data?.profiles;

  return profiles as PaginatedProfileResult | undefined;
}

const GET_PROFILES = gql`
  query Profiles($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        followNftAddress
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
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
            amount {
              asset {
                symbol
                name
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
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

export default useGetProfiles;
