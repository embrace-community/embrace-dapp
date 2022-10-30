import { ApolloProvider } from "@apollo/client";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import type { AppProps } from "next/app";
import { useState } from "react";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import { SpaceContext } from "../lib/SpaceContext";
import "../styles/globals.css";
import "../styles/extrastyles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";

const { chains, provider } = configureChains(
  [chain.goerli],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY }),
    // publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  const space = useState(-1); // No Space selected by default

  return (
    <>
      <ApolloProvider client={apolloClient}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <CeramicContext.Provider value={composeDbClient}>
              <SpaceContext.Provider value={space}>
                <ClientOnlyWrapper>
                  <Component {...pageProps} />
                </ClientOnlyWrapper>
              </SpaceContext.Provider>
            </CeramicContext.Provider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </>
  );
}
