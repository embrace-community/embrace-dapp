// Edited from original: https://github.com/lens-protocol/api-examples/blob/master/src/indexer/has-transaction-been-indexed.ts
import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/ApolloClient";
import {
  HasTxHashBeenIndexedQuery,
  HasTxHashBeenIndexedRequest,
} from "../../types/lens-generated";

const hasTxBeenIndexed = async (request: HasTxHashBeenIndexedRequest) => {
  const result = await apolloClient.query<HasTxHashBeenIndexedQuery>({
    query: HAS_TXHASH_BEEN_INDEXED,
    variables: {
      request,
    },
    fetchPolicy: "network-only",
    context: { clientName: "lensAuth" },
  });

  return result.data.hasTxHashBeenIndexed;
};
export default hasTxBeenIndexed;

export const HAS_TXHASH_BEEN_INDEXED = gql`
  query HasTxHashBeenIndexed($request: HasTxHashBeenIndexedRequest!) {
    hasTxHashBeenIndexed(request: $request) {
      ... on TransactionIndexedResult {
        indexed
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
        metadataStatus {
          status
          reason
        }
      }
      ... on TransactionError {
        reason
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
      }
      __typename
    }
  }
`;
