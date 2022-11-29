import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { Provider as StateProvider } from "react-redux";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import WalletProvider from "../lib/WalletProvider";
import { store } from "../store/store";
import "../styles/extrastyles.css";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <StateProvider store={store}>
          <WalletProvider>
            <CeramicContext.Provider value={composeDbClient}>
              <ClientOnlyWrapper>
                <Component {...pageProps} />
              </ClientOnlyWrapper>
            </CeramicContext.Provider>
          </WalletProvider>
        </StateProvider>
      </ApolloProvider>
    </>
  );
}
