import { TypedDataDomain } from "ethers";
import { splitSignature } from "ethers/lib/utils.js";
import { v4 as uuidv4 } from "uuid";
import { Address } from "wagmi";
import { createPost } from "../../../api/lens/createPost";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import saveToIpfs from "../../../lib/web3storage/saveToIpfs";
import {
  CreatePublicPostRequest,
  PublicationMainFocus,
} from "../../../types/lens-generated";

// lenster: https://github.com/lensterxyz/lenster/tree/main/apps/web
// Lens post example: https://github.com/lens-protocol/api-examples/blob/master/src/publications/post.ts
// dabit example: https://github.com/dabit3/lens-protocol-frontend
export async function saveToIpfsAndCreatePost({
  post,
  setIsloading,
  defaultProfile,
  address,
  signMessageAsync,
  signTypedDataAsync,
  lensHubContract,
  setSuccess,
}) {
  if (!post.title || !post.content) {
    return;
  }

  let ipfsResult: string;

  try {
    setIsloading(true);

    ipfsResult = (await saveToIpfs(
      {
        version: "2.0.0",
        mainContentFocus: PublicationMainFocus.Article,
        metadata_id: uuidv4(),
        description: "Created on Embrace Community",
        locale: "en-US",
        content: post.content,
        external_url: null,
        image: null,
        imageMimeType: null,
        name: post.title,
        attributes: [],
        tags: [],
        appId: "embrace_community",
      },
      post.title,
    )) as string;

    console.log("create post: ipfs result", ipfsResult);
  } catch (err: any) {
    setIsloading(false);
    console.error(`An error occurred saving post data to IPFS, ${err.message}`);
    return;
  }

  try {
    // hard coded to make the code example clear
    const createPostRequest: CreatePublicPostRequest = {
      profileId: defaultProfile?.id,
      contentURI: `ipfs://${ipfsResult}`,
      collectModule: {
        freeCollectModule: { followerOnly: true },
      },
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };

    await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

    // lens graphql call
    const result = await createPost(createPostRequest);

    if (!result) {
      setIsloading(false);
      console.error("An error occurred creating post at lens");
      return;
    }

    const formattedTypedData = getSignature(result.typedData);
    const signature = await signTypedDataAsync(formattedTypedData);

    const { v, r, s } = splitSignature(signature);

    // lens contract call
    const tx = await lensHubContract!.postWithSig({
      profileId: formattedTypedData.value.profileId,
      contentURI: formattedTypedData.value.contentURI,
      collectModule: formattedTypedData.value.collectModule,
      collectModuleInitData: formattedTypedData.value.collectModuleInitData,
      referenceModule: formattedTypedData.value.referenceModule,
      referenceModuleInitData: formattedTypedData.value.referenceModuleInitData,
      sig: { v, r, s, deadline: formattedTypedData.value.deadline },
    });

    await tx.wait();

    console.log("successfully created post: tx hash", tx.hash);
    setSuccess(tx.hash);
  } catch (err: any) {
    console.error(
      `An error occurred creating the post on lens, ${err.message}`,
    );
  } finally {
    setIsloading(false);
  }
}

function getSignature(typedData: {
  domain: TypedDataDomain;
  types: Record<string, any>;
  value: Record<string, any>;
}) {
  const formattedTypedData = {
    domain: omit(typedData.domain, "__typename"),
    types: omit(typedData.types, "__typename"),
    value: omit(typedData.value, "__typename"),
  };

  console.log("create post: getSignature", formattedTypedData);
  return formattedTypedData;
}

const omit = (object: Record<string, any>, name: string) => {
  delete object[name];
  return object;
};
