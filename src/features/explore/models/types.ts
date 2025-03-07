import { TPageSearchParams } from "@/constants";
import { SupportedChains } from "@/types/chains";
import { ECrossChainStatus } from "./enums";

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
