import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  AuthChallengeResult,
  ChallengeQuery,
  ChallengeRequest,
} from "../../types/lens-generated";

export async function getChallenge(request: ChallengeRequest) {
  const result = await apolloClient.query<ChallengeQuery, ChallengeRequest>({
    query: CHALLENGE,
    variables: request,
    context: { clientName: "lens" },
  });

  const challenge = result?.data?.challenge;

  return challenge as AuthChallengeResult | undefined;
}

const CHALLENGE = gql`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`;
