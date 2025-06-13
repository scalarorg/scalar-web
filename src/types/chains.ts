export enum ChainTypes {
  Bitcoin = 'bitcoin',
  EVM = 'evm',
  Solana = 'solana'
}

export type SupportedSolanaChains = 'solana|1';

export type SupportedBTCChains = 'bitcoin|1' | 'bitcoin|4';

export type SupportedEVMChains =
  | 'evm|1'
  | 'evm|11155111'
  | 'evm|97'
  | 'evm|56'
  | 'evm|42161'
  | 'evm|8453'
  | 'evm|10'
  | 'evm|137'
  | 'evm|234485942';

export type SupportedChains = SupportedBTCChains | SupportedEVMChains | SupportedSolanaChains;

export interface Chain {
  chain: SupportedChains;
  type: ChainTypes;
  id: string;
  blockExplorer: `https://${string}`;
  icon: string;
  blockExplorerIcon: string;
  name: string;
}

export const isCommingChains = (chain: SupportedChains) => {
  return ['evm|42161', 'evm|8453', 'evm|10', 'evm|137', 'evm|234485942'].includes(chain);
};
