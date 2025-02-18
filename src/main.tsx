import { NetworkProvider, QueryProvider } from "@/providers";
import * as ec from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

bitcoin.initEccLib(ec);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <NetworkProvider>
        <App />
      </NetworkProvider>
    </QueryProvider>
  </StrictMode>,
);
