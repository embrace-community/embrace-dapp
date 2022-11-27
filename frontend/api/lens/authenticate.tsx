import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  AuthenticateMutation,
  AuthenticationResult,
  SignedAuthChallenge,
} from "../../types/lens-generated";

export async function authenticate(request: SignedAuthChallenge) {
  const result = await apolloClient.mutate<
    AuthenticateMutation,
    SignedAuthChallenge
  >({
    mutation: AUTHENTICATE,
    variables: request,
    context: { clientName: "lens" },
  });

  const authentication = result.data?.authenticate;

  return authentication as AuthenticationResult | undefined;
}

const AUTHENTICATE = gql`
  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
    authenticate(request: { address: $address, signature: $signature }) {
      accessToken
      refreshToken
    }
  }
`;
