import { NetworkProvider, QueryProvider, WagmiProvider } from "@/providers";
import * as ec from "@bitcoin-js/tiny-secp256k1-asmjs";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import * as bitcoin from "bitcoinjs-lib";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
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
        <RainbowKitProvider>
          <NetworkProvider>
            <RouterProvider router={router} />
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  </StrictMode>,
);
