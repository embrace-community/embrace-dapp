import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { SignMessageArgs } from "@wagmi/core";
import { Address } from "wagmi";
import lensAuthentication from "../components/app/social/lensAuthentication";
import { composeDbClient } from "./CeramicContext";
import { LocalStorageKey } from "./enums";
import { parseJwt } from "./jwt";
import { lensApiUrl } from "./urls";

// Create a custom ApolloLink using the ComposeClient instance to execute operations
const composeLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    composeDbClient.execute(operation.query, operation.variables).then(
      (result) => {
        observer.next(result);
        observer.complete();
      },
      (error) => {
        observer.error(error);
      },
    );
  });
});

const lensLink = new HttpLink({ uri: lensApiUrl });

const lensAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(LocalStorageKey.LensAccessToken);
  if (!token) {
    // TODO: Implement refresh token auth
    throw Error(`No access token available`);
  }

  console.log("jwt token:", token);

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      "x-access-token": token ? `Bearer ${token}` : "",
    },
  });

  // Call the next link in the middleware chain.
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(async ({ message, locations, path, extensions }) => {
      if (extensions?.code === "UNAUTHENTICATED") {
        console.log("Not / no longer authenticated.");
        // TODO: Add refreshtoken re-authentication

        console.log(
          "Removing Keys from localStorage. Need to freshly authenticate again.",
        );

        localStorage.removeItem(LocalStorageKey.LensAccessToken);
        localStorage.removeItem(LocalStorageKey.LensRefreshToken);
      }

      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations,
        )}, Path: ${path}`,
      );
    });

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// Use the created ApolloLink instance in your ApolloClient configuration
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.split(
    (operation) => operation.getContext().clientName === "lens",
    from([errorLink, lensLink]),

    ApolloLink.split(
      (operation) => operation.getContext().clientName === "lensAuth",
      from([errorLink, lensAuthLink, lensLink]),

      ApolloLink.split(
        (operation) => operation.getContext().clientName === "compose",
        from([errorLink, composeLink]),
      ),
    ),
  ),
});

export default async function lensAuthenticationIfNeeded(
  address: Address,
  signMessageAsync: (
    args?: SignMessageArgs | undefined,
  ) => Promise<`0x${string}`>,
) {
  const lensAccessKey = localStorage.getItem(LocalStorageKey.LensAccessToken);

  let justRefreshToken = false;

  if (lensAccessKey) {
    const jwt = parseJwt(lensAccessKey);

    const isAccessTokenExpired = new Date(jwt?.exp * 1e3) < new Date();

    if (isAccessTokenExpired) justRefreshToken = true;
  }

  if (!lensAccessKey || justRefreshToken) {
    const authentication = await lensAuthentication({
      address,
      signMessageAsync,
      justRefreshToken,
    });

    localStorage.setItem(
      LocalStorageKey.LensAccessToken,
      authentication!.accessToken,
    );
    localStorage.setItem(
      LocalStorageKey.LensRefreshToken,
      authentication!.refreshToken,
    );

    return authentication;
  }

  return lensAccessKey;
}
