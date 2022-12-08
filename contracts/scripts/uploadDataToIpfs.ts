// https://docs.opensea.io/docs/metadata-standards
// https://docs.lens.xyz/docs/metadata-standards
// https://docs.lens.xyz/docs/media
import "dotenv/config";
import { Web3Storage, getFilesFromPath } from "web3.storage";

import { web3StorageKey } from "../envs";

async function main() {
  const filename = process.argv[2];
  if (!filename) {
    throw new Error("File needs to be specified.");
  }

  const files = await getFilesFromPath(`./scripts/upload-data/${filename}`);

  const web3StorageClient = new Web3Storage({
    token: web3StorageKey,
  });

  console.log(`Uploading ${filename} to Web3 Storage...`);

  const cid = await web3StorageClient.put([files[0]], {
    wrapWithDirectory: false,
  });

  console.log("Content added with CID:", cid);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
