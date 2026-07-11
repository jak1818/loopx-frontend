"use client";

import { AppDataProvider } from "@/providers/AppDataProvider";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://loopcast.bearcrypto18.com/tonconnect-manifest.json"
    >
      <AppDataProvider>
        {children}
      </AppDataProvider>
    </TonConnectUIProvider>
  );
}