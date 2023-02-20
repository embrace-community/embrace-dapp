import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import WalletProvider from "../library/WalletProvider";
import LensProviderWrapper from "../library/LensProviderWrapper";
import ClientOnlyWrapper from "../library/ClientOnlyWrapper";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <LensProviderWrapper>
        <ClientOnlyWrapper>
          <Component {...pageProps} />
        </ClientOnlyWrapper>
      </LensProviderWrapper>
    </WalletProvider>
  );
}

export default MyApp;
