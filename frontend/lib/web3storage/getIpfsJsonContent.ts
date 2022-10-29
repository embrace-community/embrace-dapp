import getFileContent from "./getFileContent"
import getWeb3StorageClient from "./client"

const web3StorageClient = getWeb3StorageClient()

async function getIpfsJsonContent(
  cid: string,
  readAs: string = "readAsText"
): Promise<any> {
  try {
    let res = await web3StorageClient.get(cid)
    if (res?.ok) {
      let files = await res.files()

      const file = files[0]
      if (readAs === "none") return file

      let fileContent = await getFileContent(file, readAs)

      if (readAs === "readAsText") fileContent = JSON.parse(fileContent)

      return fileContent
    }
  } catch (error) {
    console.error(error)
  }
}

export default getIpfsJsonContent
