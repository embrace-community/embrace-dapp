import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ReactNode } from "react";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { colors } from "./constants";
import { infuraApiKey } from "./envs";

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { chains, provider } = configureChains(
    [
      chain.polygonMumbai,
      // chain.goerli,
      ...(process.env.NODE_ENV === "development" ? [chain.localhost] : []),
    ],
    [
      ...(process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_DEPLOYED_CHAIN_ID === "1337"
        ? [
            jsonRpcProvider({
              rpc: (chain) => ({ http: `http://localhost:8545` }),
            }),
          ]
        : []), // For local development only
      infuraProvider({ apiKey: infuraApiKey }),
      publicProvider(),
    ],
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
