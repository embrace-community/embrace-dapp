import { authenticate } from "../../../api/lens/authenticate";
import { getChallenge } from "../../../api/lens/getChallenge";
import { LocalStorageKey } from "../../../lib/enums";

export default async function lensAuthentication({
  address,
  signMessageAsync,
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

    localStorage.setItem(
      LocalStorageKey.LensAccessToken,
      authentication.accessToken,
    );
    localStorage.setItem(
      LocalStorageKey.LensRefreshToken,
      authentication.refreshToken,
    );

    return authentication;
  } catch (e: any) {
    console.error(
      `An error while authenticating on lens occured. Please try again: ${e.message}.`,
    );
  }
}
