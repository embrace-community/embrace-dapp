import { TypedDataDomain } from "ethers";
import { LENS_POLL_TIMOUT } from "../../lib/constants";
import hasTxBeenIndexed from "./hasTransactionBeenIndexed";

export function getSignature(typedData: {
  domain: TypedDataDomain;
  types: Record<string, any>;
  value: Record<string, any>;
}) {
  const formattedTypedData = {
    domain: omit(typedData.domain, "__typename"),
    types: omit(typedData.types, "__typename"),
    value: omit(typedData.value, "__typename"),
  };

  return formattedTypedData;
}

const omit = (object: Record<string, any>, name: string) => {
  delete object[name];
  return object;
};

export const pollUntilIndexed = async (
  input: { txHash: string } | { txId: string },
) => {
  try {
    while (true) {
      const response = await hasTxBeenIndexed(input);
      // console.log("pool until indexed: result", response);

      if (response.__typename === "TransactionIndexedResult") {
        // console.log("pool until indexed: indexed", response.indexed);
        // console.log(
        //   `pool until metadataStatus: ${response?.metadataStatus?.status}, status: ${response.metadataStatus?.status}, reason: ${response.metadataStatus?.reason}`,
        // );

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
          `pool until indexed: sleep for ${LENS_POLL_TIMOUT} milliseconds then try again`,
        );
        // sleep for a second before trying again
        await new Promise((resolve) => setTimeout(resolve, LENS_POLL_TIMOUT));
      } else {
        // it got reverted and failed!
        throw new Error(response.reason);
      }
    }
  } catch (err: any) {
    console.error(`An error occurred polling the lens tx, ${err.message}`);
  }
};
