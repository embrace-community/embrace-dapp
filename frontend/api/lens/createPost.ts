import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  CreatePostBroadcastItemResult,
  CreatePostTypedDataMutation,
  CreatePublicPostRequest,
} from "../../types/lens-generated";

export async function createPost(request: CreatePublicPostRequest) {
  const result = await apolloClient.mutate<
    CreatePostTypedDataMutation,
    { request: CreatePublicPostRequest }
  >({
    mutation: CREATE_PUBLICATION,
    variables: { request },
    context: { clientName: "lensAuth" },
  });

  const createPost = result.data?.createPostTypedData;

  return createPost as CreatePostBroadcastItemResult | undefined;
}

const CREATE_PUBLICATION = gql`
  mutation CreatePostTypedData($request: CreatePublicPostRequest!) {
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
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
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    }
  }
`;
