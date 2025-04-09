import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { bscTestnet, sepolia } from "wagmi/chains";

const chains = [sepolia, bscTestnet] as const;
const transports = {
  [sepolia.id]: http("https://api.zan.top/eth-sepolia"),
  [bscTestnet.id]: http("https://bsc-testnet-rpc.publicnode.com"),
};

export const wagmiConfig = getDefaultConfig({
  appName: "Scalar",
  projectId: import.meta.env.VITE_REOWN_CLOUD_PROJECT_ID,
  chains: [sepolia, bscTestnet],
  ssr: true,
  transports,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const isSupportedChain = (
  chainId: number,
): chainId is (typeof chains)[number]["id"] => {
  return chains
    .map((chain) => chain.id)
    .includes(chainId as (typeof chains)[number]["id"]);
};

export const getWagmiChain = (chainId: number) => {
  return chains.find((chain) => chain.id === chainId);
};
