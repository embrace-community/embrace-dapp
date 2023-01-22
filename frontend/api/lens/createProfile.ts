import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  CreateProfileMutation,
  CreateProfileRequest,
  RelayErrorReasons,
} from "../../types/lens-generated";

export async function createProfile(request: CreateProfileRequest) {
  const result = await apolloClient.mutate<
    CreateProfileMutation,
    { request: CreateProfileRequest }
  >({
    mutation: CREATE_PROFILE,
    variables: { request },
    context: { clientName: "lensAuth" },
  });

  const createdProfile:
    | {
        __typename: "RelayError";
        reason: RelayErrorReasons;
      }
    | {
        __typename: "RelayerResult";
        txHash: any;
      }
    | undefined = result.data?.createProfile;

  return createdProfile;
}

const CREATE_PROFILE = gql`
  mutation CreateProfile(
    $request: CreateProfileRequest! # $handle: Handle! # $profilePictureUri: Url # $followNFTURI: FollowModuleParams # $followModule: Url
  ) {
    createProfile(
      request: $request # { # handle: $handle # profilePictureUri: $profilePictureUri # followNFTURI: $followNFTURI # followModule: $followModule # }
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
