import { ApolloProvider } from "@apollo/client";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { Provider } from "react-redux";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import { colors } from "../lib/constants";
import { SpaceContext } from "../lib/SpaceContext";
import { store } from "../store/store";
import "../styles/extrastyles.css";
import "../styles/globals.css";

const { chains, provider } = configureChains(
  [
    chain.polygonMumbai,
    chain.goerli,
    ...(process.env.NODE_ENV === "development" ? [chain.localhost] : []),
  ],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ chains })],
  },
]);

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
        <Provider store={store}>
          <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
              chains={chains}
              theme={lightTheme({
                accentColor: colors.main,
              })}
            >
              <CeramicContext.Provider value={composeDbClient}>
                <SpaceContext.Provider value={space}>
                  <ClientOnlyWrapper>
                    <Component {...pageProps} />
                  </ClientOnlyWrapper>
                </SpaceContext.Provider>
              </CeramicContext.Provider>
            </RainbowKitProvider>
          </WagmiConfig>
        </Provider>
      </ApolloProvider>
    </>
  );
}
