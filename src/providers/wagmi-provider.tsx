import { ReactNode } from "react";
import { WagmiProvider as BaseWagmiProvider } from "wagmi";
import { sepolia, bscTestnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const config = getDefaultConfig({
  appName: "Scalar",
  projectId: import.meta.env.VITE_REOWN_CLOUD_PROJECT_ID,
  chains: [sepolia, bscTestnet],
});
export default function WagmiProvider({ children }: { children: ReactNode }) {
  return <BaseWagmiProvider config={config}>{children}</BaseWagmiProvider>;
}
