import { LensProvider, LensConfig, staging } from "@lens-protocol/react";
import { localStorage } from "@lens-protocol/react/web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";
import { ReactNode } from "react";

export default function LensProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const lensConfig: LensConfig = {
    bindings: wagmiBindings(),
    environment: staging,
    storage: localStorage(),
  };

  return (
    <LensProvider config={lensConfig} onError={console.log}>
      {children}
    </LensProvider>
  );
}
