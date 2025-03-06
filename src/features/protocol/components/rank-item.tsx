import BronzeRankIcon from "@/assets/icons/bronze-rank.svg";
import GoldRankIcon from "@/assets/icons/gold-rank.svg";
import SilverRankIcon from "@/assets/icons/silver-rank.svg";
import { formatNumber } from "@/lib/utils";
import { ReactNode } from "react";

export type TRankItem = {
  name: string;
  value: number;
};

const RANK_ICON: Record<number, ReactNode> = {
  1: <GoldRankIcon />,
  2: <SilverRankIcon />,
  3: <BronzeRankIcon />,
};

export const RankItem = ({
  name,
  value,
  rank,
}: TRankItem & { rank: number }) => {
  return (
    <div className="flex items-center justify-between gap-1 px-6 py-2 text-lg odd:bg-[#F7F9FF]">
      <p className="w-5">{rank}</p>
      <div className="flex w-6 items-center justify-center">
        {RANK_ICON[rank]}
      </div>
      <p className="flex-1 text-primary">{name}</p>
      <p className="font-semibold">{formatNumber(value)}</p>
    </div>
  );
};
