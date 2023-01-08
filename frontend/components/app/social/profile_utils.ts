import { Address } from "wagmi";
import { setDefaultProfile } from "../../../api/lens/setDefaultProfile";
import { splitSignature } from "ethers/lib/utils.js";
import { getSignature, pollUntilIndexed } from "../../../api/lens/utils";
import lensAuthenticationIfNeeded from "../../../lib/ApolloClient";
import { createProfile } from "../../../api/lens/createProfile";
import { deleteProfile } from "../../../api/lens/deleteProfile";

export async function setDefaultProfileAndPoll({
  lensAuthenticationIfNeeded,
  address,
  profileId,
  signMessageAsync,
  signTypedDataAsync,
  lensHubContract,
}) {
  await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

  const result = await setDefaultProfile({ profileId });

  if (!result) {
    console.error("An error occurred setting the profile at lens");
    return;
  }

  const formattedTypedData = getSignature(result.typedData);
  const signature = await signTypedDataAsync(formattedTypedData);
  console.log("set default profile: signature", signature);

  const { v, r, s } = splitSignature(signature);

  // lens contract call
  const tx = await lensHubContract.setDefaultProfileWithSig({
    profileId: formattedTypedData.value.profileId,
    wallet: formattedTypedData.value.wallet,
    sig: { v, r, s, deadline: formattedTypedData.value.deadline },
  });

  await pollUntilIndexed({ txHash: tx.hash });

  console.log("successfully set default profile: tx hash", tx.hash);

  return result;
}

export async function createLensProfileAndPoll({
  address,
  signMessageAsync,
  profileName,
}) {
  await lensAuthenticationIfNeeded(address as Address, signMessageAsync);

  const result = await createProfile({
    handle: profileName,
    profilePictureUri: "", // TODO: let user set profile picture?
  });

  if (!result || result?.reason) {
    throw new Error(
      `No create profile response from lens received. ${
        result.reason ?? "Please try to login again."
      }`,
    );
  }

  await pollUntilIndexed({ txHash: result?.txHash });

  console.log("successfully set created profile: tx hash", result?.txHash);

  return result;
}

export async function burnLensProfileAndPoll({
  address,
  signMessageAsync,
  selectedProfile,
  signTypedDataAsync,
  lensHubContract,
}) {
  await lensAuthenticationIfNeeded(address as Address, signMessageAsync);
  const result = await deleteProfile({ profileId: selectedProfile.id });

  if (!result) {
    throw new Error(
      `No create profile response from lens received. Please try to login again.`,
    );
  }

  const typedData = result.typedData;
  console.log("burn profile: typedData", typedData);

  const formattedTypedData = getSignature(result.typedData);
  const signature = await signTypedDataAsync(formattedTypedData);
  console.log("burn profile: signature", signature);

  const { v, r, s } = splitSignature(signature);
  const tx = await lensHubContract.burnWithSig(typedData.value.tokenId, {
    v,
    r,
    s,
    deadline: formattedTypedData.value.deadline,
  });

  await pollUntilIndexed({ txHash: tx.hash });

  console.log("successfully burned profile: tx hash", tx.hash);

  return result;
}
