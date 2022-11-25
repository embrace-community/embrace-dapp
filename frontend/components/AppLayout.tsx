import Head from "next/head";
import { ReactNode } from "react";
import { Chain, useNetwork } from "wagmi";
import { deployedChainId } from "../lib/envs";
import Nav from "./Nav";

export default function AppLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: ReactNode;
}) {
  const { chains, chain } = useNetwork();

  const isOnWrongNetwork = chain?.id && chain.id !== Number(deployedChainId);

  return (
    <div className="bg-embracebg min-h-screen flex flex-col items-start justify-start">
      <Head>
        <title>Embrace Community: {title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Nav />

      <main className="w-full flex flex-1 flex-col justify-start items-start">
        {isOnWrongNetwork ? (
          <div className="w-full text-center text-embracedark">
            <p className="text-2xl">
              Please switch to chain{" "}
              {chains?.find((c: Chain) => c.id === deployedChainId)?.name}
            </p>

            <p className="my-5 text-xl">You are currently on {chain?.name}</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
