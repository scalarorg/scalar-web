import { TPageSearchParams } from "@/constants";
import { SupportedChains } from "@/types/chains";
import { ECrossChainStatus, ETimeBucket } from "./enums";

type TList<T> = {
  data: T[];
  total: number;
};

type TCommon = {
  chain: SupportedChains;
  chain_name: string;
  tx_hash: string;
  block_height: number;
  status: string;
  value: string;
  fee: string;
  asset: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    is_native: boolean;
  };
  created_at: number;
};

export type TExploreParams = {
  type?: string;
} & TPageSearchParams;

export type TExplore = {
  id: string;
  type: string;
  status: ECrossChainStatus;
  source: TCommon & {
    sender: string;
  };
  destination: TCommon & {
    receiver: string;
  };
};

export type TExploreList = TList<TExplore>;

export type TExploreStatisticParams = {
  time_bucket: ETimeBucket;
} & TPageSearchParams;

export type TStatisticChartItem = {
  data: number;
  time: number;
};

export type TStatisticRankItem = {
  address: string;
  amount: number;
};

export type TStatisticPathItem = {
  source_chain: SupportedChains;
  destination_chain: SupportedChains;
  amount: number;
};

export type TStatisticSourceItem = {
  chain: SupportedChains;
  amount: number;
};

export type TStatisticDestinationItem = {
  chain: SupportedChains;
  amount: number;
};

export type TExploreStatisticData = {
  txs: TStatisticChartItem[];
  volumes: TStatisticChartItem[];
  active_users: TStatisticChartItem[];
  new_users: TStatisticChartItem[];
  total_txs: number;
  total_volumes: number;
  total_users: number;
  top_users: TStatisticRankItem[];
  top_bridges: TStatisticRankItem[];
  top_paths_by_tx: TStatisticPathItem[];
  top_paths_by_volume: TStatisticPathItem[];
  top_source_chains_by_tx: TStatisticSourceItem[];
  top_source_chains_by_volume: TStatisticSourceItem[];
  top_destination_chains_by_tx: TStatisticDestinationItem[];
  top_destination_chains_by_volume: TStatisticDestinationItem[];
};
