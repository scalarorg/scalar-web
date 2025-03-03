import {
  ErrorProvider,
  KeplrProvider,
  NetworkProvider,
  QueryProvider,
  WagmiProvider,
  WalletProvider,
} from "@/providers";
import * as ec from "@bitcoin-js/tiny-secp256k1-asmjs";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import * as bitcoin from "bitcoinjs-lib";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { scalarConfig } from "./lib/scalar";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

bitcoin.initEccLib(ec);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider>
      <QueryProvider>
        <ErrorProvider>
          <RainbowKitProvider>
            <NetworkProvider>
              <WalletProvider>
                <KeplrProvider config={scalarConfig()}>
                  <RouterProvider router={router} />
                </KeplrProvider>
              </WalletProvider>
            </NetworkProvider>
          </RainbowKitProvider>
        </ErrorProvider>
      </QueryProvider>
    </WagmiProvider>
    <Toaster />
    <Sonner richColors />
  </StrictMode>,
);
