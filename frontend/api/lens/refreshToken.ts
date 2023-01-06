import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  AuthenticationResult,
  RefreshMutation,
  RefreshRequest,
} from "../../types/lens-generated";

export async function refreshToken(request: RefreshRequest) {
  const result = await apolloClient.mutate<
    RefreshMutation,
    { request: RefreshRequest }
  >({
    mutation: REFRESH_TOKEN,
    variables: { request },
    context: { clientName: "lens" },
  });

  const authentication = result.data?.refresh;

  return authentication as AuthenticationResult | undefined;
}

const REFRESH_TOKEN = gql`
  mutation Refresh {
    refresh(request: $request) {
      accessToken
      refreshToken
    }
  }
`;
