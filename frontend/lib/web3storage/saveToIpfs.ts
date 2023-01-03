import { CIDString } from "web3.storage";
import getWeb3StorageClient from "./client";

const web3StorageClient = getWeb3StorageClient();

function saveToIpfs(
  object: any,
  filename: string,
  wrapWithDirectory: boolean = false,
): Promise<CIDString | Error> {
  return new Promise(async (resolve, reject) => {
    /* save json to ipfs */
    try {
      const blob = new Blob([JSON.stringify(object)], {
        type: "application/json",
      });
      const blobFile = new File([blob], filename);

      const uploadedCID = await web3StorageClient.put([blobFile], {
        wrapWithDirectory,
      });

      console.log("Uploading object to ipfs...");
      console.log("Data: ", JSON.stringify(object, null, 4));
      console.log("CID: ", uploadedCID);

      resolve(uploadedCID);
    } catch (error: any) {
      console.log("An error occurred uploading to ipfs: ", error?.message);

      reject(error);
    }
  });
}

export default saveToIpfs;
