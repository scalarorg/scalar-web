import bscTestnet from '@/assets/images/bsc-testnet.png';
import bscscan from '@/assets/images/bscscan.png';
import btcMainnet from '@/assets/images/btc-mainnet.png';
import btcTestnet4 from '@/assets/images/btc-testnet4.png';
import ethMainnet from '@/assets/images/eth-mainnet.png';
import ethSepolia from '@/assets/images/eth-sepolia.png';
import etherscan from '@/assets/images/etherscan.png';

import arbitrumIcon from '@/assets/images/arbitrum.png';
import baseIcon from '@/assets/images/base.png';
import optimismIcon from '@/assets/images/optimism.png';
import polygonIcon from '@/assets/images/polygon.png';
import solanaIcon from '@/assets/images/solana.png';
import starknetIcon from '@/assets/images/starknet.png';

import mempool from '@/assets/images/mempool.png';
import { Chain, ChainTypes, SupportedChains } from '@/types/chains';

export const Chains: Record<SupportedChains, Chain> = {
  'bitcoin|1': {
    chain: 'bitcoin|1',
    type: ChainTypes.Bitcoin,
    id: '1',
    blockExplorer: 'https://mempool.space',
    icon: btcMainnet,
    blockExplorerIcon: mempool,
    name: 'Mainnet'
  },
  'bitcoin|4': {
    chain: 'bitcoin|4',
    type: ChainTypes.Bitcoin,
    id: '4',
    blockExplorer: 'https://mempool.space/testnet4',
    icon: btcTestnet4,
    blockExplorerIcon: mempool,
    name: 'Testnet 4'
  },
  'evm|1': {
    chain: 'evm|1',
    type: ChainTypes.EVM,
    id: '1',
    blockExplorer: 'https://etherscan.io',
    icon: ethMainnet,
    blockExplorerIcon: etherscan,
    name: 'Mainnet'
  },
  'evm|11155111': {
    chain: 'evm|11155111',
    type: ChainTypes.EVM,
    id: '11155111',
    blockExplorer: 'https://sepolia.etherscan.io',
    icon: ethSepolia,
    blockExplorerIcon: etherscan,
    name: 'Sepolia'
  },
  'evm|56': {
    chain: 'evm|56',
    type: ChainTypes.EVM,
    id: '56',
    blockExplorer: 'https://bscscan.com',
    icon: bscscan,
    blockExplorerIcon: bscscan,
    name: 'BSC Mainnet'
  },
  'evm|97': {
    chain: 'evm|97',
    type: ChainTypes.EVM,
    id: '97',
    blockExplorer: 'https://testnet.bscscan.com',
    icon: bscTestnet,
    blockExplorerIcon: bscscan,
    name: 'BSC Testnet'
  },
  'evm|42161': {
    chain: 'evm|42161',
    type: ChainTypes.EVM,
    id: '42161',
    blockExplorer: 'https://arbiscan.io',
    icon: arbitrumIcon,
    blockExplorerIcon: arbitrumIcon,
    name: 'Arbitrum'
  },
  'evm|8453': {
    chain: 'evm|8453',
    type: ChainTypes.EVM,
    id: '8453',
    blockExplorer: 'https://basescan.org',
    icon: baseIcon,
    blockExplorerIcon: baseIcon,
    name: 'Base'
  },
  'evm|10': {
    chain: 'evm|10',
    type: ChainTypes.EVM,
    id: '10',
    blockExplorer: 'https://optimistic.etherscan.io',
    icon: optimismIcon,
    blockExplorerIcon: optimismIcon,
    name: 'Optimism'
  },
  'evm|137': {
    chain: 'evm|137',
    type: ChainTypes.EVM,
    id: '137',
    blockExplorer: 'https://polygonscan.com',
    icon: polygonIcon,
    blockExplorerIcon: polygonIcon,
    name: 'Polygon'
  },
  'evm|234485942': {
    chain: 'evm|234485942',
    type: ChainTypes.EVM,
    id: '234485942',
    blockExplorer: 'https://starknet.io',
    icon: starknetIcon,
    blockExplorerIcon: starknetIcon,
    name: 'Starknet'
  },
  'solana|1': {
    chain: 'solana|1',
    type: ChainTypes.Solana,
    id: '1',
    blockExplorer: 'https://solana.com',
    icon: solanaIcon,
    blockExplorerIcon: solanaIcon,
    name: 'Solana'
  }
};
