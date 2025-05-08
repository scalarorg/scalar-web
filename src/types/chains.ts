export enum ChainTypes {
  Bitcoin = "bitcoin",
  EVM = "evm",
}

export type SupportedBTCChains = "bitcoin|1" | "bitcoin|4";

export type SupportedEVMChains = "evm|1" | "evm|11155111" | "evm|97" | "evm|56";

export type SupportedChains = SupportedBTCChains | SupportedEVMChains;

export interface Chain {
  chain: SupportedChains;
  type: ChainTypes;
  id: string;
  blockExplorer: `https://${string}`;
  icon: string;
  blockExplorerIcon: string;
  name: string;
}
