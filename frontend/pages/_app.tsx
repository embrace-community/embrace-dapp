import { ApolloProvider } from "@apollo/client";
import {
  Chain,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import ClientOnlyWrapper from "../components/ClientOnlyWrapper";
import { apolloClient } from "../lib/ApolloClient";
import { CeramicContext, composeDbClient } from "../lib/CeramicContext";
import { colors } from "../lib/constants";
import { SpaceContext } from "../lib/SpaceContext";
import "../styles/extrastyles.css";
import "../styles/globals.css";

const evmosTestnetChain: Chain = {
  id: 9000,
  name: "Evmos Testnet",
  network: "evmos-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "TEVMOS",
    symbol: "TEVMOS",
  },
  rpcUrls: {
    default: "https://eth.bd.evmos.dev:8545",
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://evm.evmos.dev/" },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [chain.goerli, chain.localhost, evmosTestnetChain],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }),
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== evmosTestnetChain.id) return null;
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Embrace.Community",
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
      </ApolloProvider>
    </>
  );
}
