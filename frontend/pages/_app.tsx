import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { useState } from "react";
import { Provider as StateProvider } from "react-redux";
import { useSigner } from "wagmi";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import { SpaceContext } from "../lib/SpaceContext";
import WalletProvider from "../lib/WalletProvider";
import { store } from "../store/store";
import "../styles/extrastyles.css";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const space = useState(-1); // No Space selected by default

  return (
    <>
      <ApolloProvider client={apolloClient}>
        <StateProvider store={store}>
          <WalletProvider>
            <CeramicContext.Provider value={composeDbClient}>
              <SpaceContext.Provider value={space}>
                <ClientOnlyWrapper>
                  <Component {...pageProps} />
                </ClientOnlyWrapper>
              </SpaceContext.Provider>
            </CeramicContext.Provider>
          </WalletProvider>
        </StateProvider>
      </ApolloProvider>
    </>
  );
}
