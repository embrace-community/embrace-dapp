import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ReactNode } from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { colors } from "./constants";
import { infuraApiKey } from "./envs";
import { polygonMumbai, localhost, polygon } from "wagmi/chains";

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { chains, provider, webSocketProvider } = configureChains(
    [
      polygonMumbai,
      polygon,
      ...(process.env.NODE_ENV === "development" ? [localhost] : []),
    ],
    [
      ...(process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_DEPLOYED_CHAIN_ID === "1337"
        ? [
            jsonRpcProvider({
              rpc: () => ({ http: `http://localhost:8545` }),
            }),
          ]
        : []), // For local development only
      infuraProvider({ apiKey: infuraApiKey }),
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
    webSocketProvider,
  });

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: colors.main,
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
