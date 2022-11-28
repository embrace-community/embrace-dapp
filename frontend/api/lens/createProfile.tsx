import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  CreateProfileMutation,
  CreateProfileRequest,
  RelayerResult,
} from "../../types/lens-generated";

export async function createProfile(request: CreateProfileRequest) {
  const result = await apolloClient.mutate<
    CreateProfileMutation,
    CreateProfileRequest
  >({
    mutation: CREATE_PROFILE,
    variables: request,
    context: { clientName: "lensAuth" },
  });

  const createdProfile = result.data?.createProfile;

  return createdProfile as RelayerResult | undefined;
}

const CREATE_PROFILE = gql`
  mutation CreateProfile(
    $handle: Handle!
    $profilePictureUri: Url
    $followNFTURI: FollowModuleParams
    $followModule: Url
  ) {
    createProfile(
      request: {
        handle: $handle
        profilePictureUri: $profilePictureUri
        followNFTURI: $followNFTURI
        followModule: $followModule
      }
    ) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
      __typename
    }
  }
`;
