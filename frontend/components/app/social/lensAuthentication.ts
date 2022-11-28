import { SignMessageArgs } from "@wagmi/core";
import { Address } from "wagmi";
import { authenticate } from "../../../api/lens/authenticate";
import { getChallenge } from "../../../api/lens/getChallenge";
import { LocalStorageKey } from "../../../lib/enums";
import { AuthenticationResult } from "../../../types/lens-generated";

export default async function lensAuthentication({
  address,
  signMessageAsync,
}: {
  address: Address;
  signMessageAsync: (
    args?: SignMessageArgs | undefined,
  ) => Promise<`0x${string}`>;
}) {
  try {
    const challenge = await getChallenge({ address });

    if (!challenge) {
      throw new Error(
        `No challenge response from lens received. Please try to login again.`,
      );
    }
    const signature = await signMessageAsync({ message: challenge.text });

    const authentication = await authenticate({ address, signature });

    if (!authentication) {
      throw new Error(
        `No authentication response from lens received. Please try to login again.`,
      );
    }

    return authentication as AuthenticationResult;
  } catch (e: any) {
    console.error(
      `An error while authenticating on lens occured. Please try again: ${e.message}.`,
    );
  }
}
