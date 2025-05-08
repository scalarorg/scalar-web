import bscTestnet from "@/assets/images/bsc-testnet.png";
import bscscan from "@/assets/images/bscscan.png";
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
    name: "Mainnet",
  },
  "bitcoin|4": {
    chain: "bitcoin|4",
    type: ChainTypes.Bitcoin,
    id: "4",
    blockExplorer: "https://mempool.space/testnet4",
    icon: btcTestnet4,
    blockExplorerIcon: mempool,
    name: "Testnet 4",
  },
  "evm|1": {
    chain: "evm|1",
    type: ChainTypes.EVM,
    id: "1",
    blockExplorer: "https://etherscan.io",
    icon: ethMainnet,
    blockExplorerIcon: etherscan,
    name: "Mainnet",
  },
  "evm|11155111": {
    chain: "evm|11155111",
    type: ChainTypes.EVM,
    id: "11155111",
    blockExplorer: "https://sepolia.etherscan.io",
    icon: ethSepolia,
    blockExplorerIcon: etherscan,
    name: "Sepolia",
  },
  "evm|56": {
    chain: "evm|56",
    type: ChainTypes.EVM,
    id: "56",
    blockExplorer: "https://bscscan.com",
    icon: bscscan,
    blockExplorerIcon: bscscan,
    name: "BSC Mainnet",
  },
  "evm|97": {
    chain: "evm|97",
    type: ChainTypes.EVM,
    id: "97",
    blockExplorer: "https://testnet.bscscan.com",
    icon: bscTestnet,
    blockExplorerIcon: bscscan,
    name: "BSC Testnet",
  },
};
