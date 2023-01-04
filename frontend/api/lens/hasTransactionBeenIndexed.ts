// Edited from original: https://github.com/lens-protocol/api-examples/blob/master/src/indexer/has-transaction-been-indexed.ts
import { apolloClient } from "../../lib/ApolloClient";
import {
  HasTxHashBeenIndexedDocument,
  HasTxHashBeenIndexedRequest,
} from "../../types/lens-generated";

const hasTxBeenIndexed = async (request: HasTxHashBeenIndexedRequest) => {
  const result = await apolloClient.query({
    query: HasTxHashBeenIndexedDocument,
    variables: {
      request,
    },
    fetchPolicy: "network-only",
  });

  return result.data.hasTxHashBeenIndexed;
};

export const pollUntilIndexed = async (
  input: { txHash: string } | { txId: string },
) => {
  while (true) {
    const response = await hasTxBeenIndexed(input);
    console.log("pool until indexed: result", response);

    if (response.__typename === "TransactionIndexedResult") {
      console.log("pool until indexed: indexed", response.indexed);
      console.log(
        "pool until metadataStatus: metadataStatus",
        response.metadataStatus,
      );

      console.log(response.metadataStatus);
      if (response.metadataStatus) {
        if (response.metadataStatus.status === "SUCCESS") {
          return response;
        }

        if (response.metadataStatus.status === "METADATA_VALIDATION_FAILED") {
          throw new Error(response.metadataStatus.status);
        }
      } else {
        if (response.indexed) {
          return response;
        }
      }

      console.log(
        "pool until indexed: sleep for 1500 milliseconds then try again",
      );
      // sleep for a second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      // it got reverted and failed!
      throw new Error(response.reason);
    }
  }
};
