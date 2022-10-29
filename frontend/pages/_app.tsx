import { ApolloProvider } from "@apollo/client";
import { chains, providers } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import type { AppProps } from "next/app";
import { useState } from "react";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import { SpaceContext } from "../lib/SpaceContext";
import "../styles/globals.css";
import "../styles/extrastyles.css";

if (!process.env.NEXT_PUBLIC_PROJECT_ID)
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");

// Configure web3modal
const modalConfig = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  theme: "light" as const,
  accentColor: "blue" as const,
  ethereum: {
    appName: "web3Modal",
    autoConnect: true,
    chains: [
      chains.mainnet,
      chains.avalanche,
      chains.polygon,
      chains.binanceSmartChain,
    ],
    providers: [
      providers.walletConnectProvider({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      }),
    ],
  },
};

export default function App({ Component, pageProps }: AppProps) {
  const space = useState(-1); // No Space selected by default
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <CeramicContext.Provider value={composeDbClient}>
          <SpaceContext.Provider value={space}>
            <ClientOnlyWrapper>
              <Component {...pageProps} />
            </ClientOnlyWrapper>
          </SpaceContext.Provider>
          <Web3Modal config={modalConfig} />
        </CeramicContext.Provider>
      </ApolloProvider>
    </>
  );
}
