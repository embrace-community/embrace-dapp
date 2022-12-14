import getFileContent from "./getFileContent";
import getWeb3StorageClient from "./client";
import { CIDString, Web3File } from "web3.storage";
import { ipfsGateway } from "../urls";

const web3StorageClient = getWeb3StorageClient();

async function getIpfsJsonContent(
  cid: string,
  readAs: "readAsText" | "readAsDataURL" | "none" = "readAsText",
): Promise<string | Web3File | undefined | Record<string, any>> {
  try {
    // NOTES: This returns metadata information much more quickly than the other method. using web3StorageClient.get(cid)
    // On some occasions, when creating a space the metadata is not found using other method but works using fetch
    let res = await fetch(getFileUri(cid));

    if (res?.ok) {
      const json = await res.json();

      return await json;
    }
  } catch (error) {
    console.error(error);
  }

  // try {
  //   let res = await web3StorageClient.get(cid);
  //   if (res?.ok) {
  //     let files = await res.files();
  //     const file = files[0];
  //     if (readAs === "none") return file;
  //     let fileContent: string | Record<string, any> = await getFileContent(
  //       file,
  //       readAs,
  //     );
  //     if (readAs === "readAsText") fileContent = JSON.parse(fileContent);
  //     return fileContent;
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
}

function getFileUri(cid: CIDString) {
  return `https://${cid}.${ipfsGateway}/`;
}

export { getIpfsJsonContent, getFileUri };
