import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode } from "react";
import { WagmiProvider as BaseWagmiProvider } from "wagmi";
import { bscTestnet, sepolia } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Scalar",
  projectId: import.meta.env.VITE_REOWN_CLOUD_PROJECT_ID,
  chains: [sepolia, bscTestnet],
});
export default function WagmiProvider({ children }: { children: ReactNode }) {
  return <BaseWagmiProvider config={config}>{children}</BaseWagmiProvider>;
}
