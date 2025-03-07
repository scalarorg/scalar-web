import { z } from "zod";
import { ESortDirection } from "./enums";
import { Chain, ChainTypes, SupportedChains } from "./types/chains";

export const COMMON_VALIDATE_PAGE_SEARCH_PARAMS = z.object({
  size: z.number().optional(),
  offset: z.number().optional(),
  sort: z.string().optional(),
  sortDirection: z.nativeEnum(ESortDirection).optional(),
  q: z.string().optional(),
});

export type TPageSearchParams = z.infer<
  typeof COMMON_VALIDATE_PAGE_SEARCH_PARAMS
>;
export const Chains: Record<SupportedChains, Chain> =
{
  "bitcoin|1": {
    chain: "bitcoin|1",
    type: ChainTypes.Bitcoin,
    id: "1",
    blockExplorer: "https://mempool.space",
  },
  "bitcoin|4": {
    chain: "bitcoin|4",
    type: ChainTypes.Bitcoin,
    id: "4",
    blockExplorer: "https://mempool.space/testnet4",
  },
  "evm|1": {
    chain: "evm|1",
    type: ChainTypes.EVM,
    id: "1",
    blockExplorer: "https://etherscan.io",
  },
  "evm|11155111": {
    chain: "evm|11155111",
    type: ChainTypes.EVM,
    id: "11155111",
    blockExplorer: "https://sepolia.etherscan.io",
  },
}
