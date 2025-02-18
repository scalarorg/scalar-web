import { NetworkProvider, QueryProvider, WagmiProvider } from "@/providers";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import * as ec from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

bitcoin.initEccLib(ec);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider>
      <QueryProvider>
        <RainbowKitProvider>
          <NetworkProvider>
            <App />
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  </StrictMode>
);
