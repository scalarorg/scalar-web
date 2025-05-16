import { wagmiConfig } from "@/lib/wagmi";
import { ReactNode } from "react";
import { WagmiProvider as BaseWagmiProvider } from "wagmi";

export default function WagmiProvider({ children }: { children: ReactNode }) {
  return <BaseWagmiProvider config={wagmiConfig}>{children}</BaseWagmiProvider>;
}
