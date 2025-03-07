import btcMainnet from "@/assets/images/btc-mainnet.png";
import btcTestnet4 from "@/assets/images/btc-testnet4.png";
import ethMainnet from "@/assets/images/eth-mainnet.png";
import ethSepolia from "@/assets/images/eth-sepolia.png";
import etherscan from "@/assets/images/etherscan.png";
import mempool from "@/assets/images/mempool.png";
import { Chain, ChainTypes, SupportedChains } from "@/types/chains";

export const Chains: Record<SupportedChains, Chain> = {
  "bitcoin|1": {
    chain: "bitcoin|1",
    type: ChainTypes.Bitcoin,
    id: "1",
    blockExplorer: "https://mempool.space",
    icon: btcMainnet,
    blockExplorerIcon: mempool,
  },
  "bitcoin|4": {
    chain: "bitcoin|4",
    type: ChainTypes.Bitcoin,
    id: "4",
    blockExplorer: "https://mempool.space/testnet4",
    icon: btcTestnet4,
    blockExplorerIcon: mempool,
  },
  "evm|1": {
    chain: "evm|1",
    type: ChainTypes.EVM,
    id: "1",
    blockExplorer: "https://etherscan.io",
    icon: ethMainnet,
    blockExplorerIcon: etherscan,
  },
  "evm|11155111": {
    chain: "evm|11155111",
    type: ChainTypes.EVM,
    id: "11155111",
    blockExplorer: "https://sepolia.etherscan.io",
    icon: ethSepolia,
    blockExplorerIcon: etherscan,
  },
};
