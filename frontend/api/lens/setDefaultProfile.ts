import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  CreateSetDefaultProfileRequest,
  CreateSetDefaultProfileTypedDataMutation,
  SetDefaultProfileBroadcastItemResult,
} from "../../types/lens-generated";

export async function setDefaultProfile(
  request: CreateSetDefaultProfileRequest,
) {
  const result = await apolloClient.mutate<
    CreateSetDefaultProfileTypedDataMutation,
    { request: CreateSetDefaultProfileRequest }
  >({
    mutation: SET_DEFAULT_PROFILE,
    variables: { request },
    context: { clientName: "lensAuth" },
  });

  const setDefaultProfile = result.data?.createSetDefaultProfileTypedData;

  return setDefaultProfile as SetDefaultProfileBroadcastItemResult | undefined;
}

const SET_DEFAULT_PROFILE = gql`
  mutation CreateSetDefaultProfileTypedData(
    $request: CreateSetDefaultProfileRequest!
  ) {
    createSetDefaultProfileTypedData(request: $request) {
      # mutation CreateSetDefaultProfileTypedData($profileId: ProfileId!) {
      #   createSetDefaultProfileTypedData(request: { profileId: $profileId }) {
      id
      expiresAt
      typedData {
        types {
          SetDefaultProfileWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          wallet
          profileId
        }
      }
    }
  }
`;
