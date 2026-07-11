import "./globals.css";
import Providers from "./providers";

import Script from "next/script";

import { AppDataProvider } from "@/providers/AppDataProvider";
import AppShell from "@/components/AppShell";
import ConditionalAppShell from "@/components/ConditionalAppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">

      <head>

        {/* PWA */}
        <link
          rel="manifest"
          href="/manifest.json"
        />

        <meta
          name="theme-color"
          content="#000000"
        />

        {/* ✅ Monetag SDK */}
        <Script
          src="//libtl.com/sdk.js"
          data-zone="10915445"
          data-sdk="show_10915445"
          strategy="afterInteractive"
        />

      </head>

      <body>

        <Providers>

          <AppDataProvider>

            <ConditionalAppShell>
              {children}
            </ConditionalAppShell>

          </AppDataProvider>

        </Providers>

        {/* 🔥 PWA Service Worker */}
        <script src="/register-sw.js" />

      </body>

    </html>
  );
}