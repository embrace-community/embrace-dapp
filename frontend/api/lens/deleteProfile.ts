import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  BurnProfileRequest,
  CreateBurnProfileBroadcastItemResult,
  CreateBurnProfileTypedDataMutation,
} from "../../types/lens-generated";

export async function deleteProfile(request: BurnProfileRequest) {
  const result = await apolloClient.mutate<
    CreateBurnProfileTypedDataMutation,
    { request: BurnProfileRequest }
  >({
    mutation: BURN_PROFILE,
    variables: { request },
    context: { clientName: "lensAuth" },
  });

  const burnedProfile = result.data?.createBurnProfileTypedData;

  return burnedProfile as CreateBurnProfileBroadcastItemResult | undefined;
}

const BURN_PROFILE = gql`
  mutation CreateBurnProfileTypedData($request: BurnProfileRequest!) {
    createBurnProfileTypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          BurnWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          tokenId
        }
      }
    }
  }
`;
