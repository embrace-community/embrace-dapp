import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { composeDbClient } from "./CeramicContext";
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

const lensLink = new HttpLink({
  uri: lensApiUrl,
});

// Use the created ApolloLink instance in your ApolloClient configuration
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.split(
    (operation) => operation.getContext().clientName === "lens",
    lensLink,
    ApolloLink.split(
      (operation) => operation.getContext().clientName === "compose",
      composeLink,
    ),
  ),
});
