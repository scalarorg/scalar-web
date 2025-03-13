import { ChainIcon } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TStatisticPathItem } from "@/features/explore";
import {
  TStatisticDestinationItem,
  TStatisticSourceItem,
} from "@/features/explore/models/types";
import { formatNumber } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export type TTopCardProps = {
  title: string;
  pathsData: TStatisticPathItem[];
  sourceData: TStatisticSourceItem[];
  destinationData: TStatisticDestinationItem[];
};

export const TopCard = ({
  title,
  pathsData,
  sourceData,
  destinationData,
}: TTopCardProps) => {
  return (
    <div
      data-slot="top-card"
      className="flex h-full flex-col rounded-lg border p-6"
    >
      <p className="mb-4 font-semibold text-2xl">{title}</p>
      <div className="flex h-full gap-5">
        <div className="flex-1 space-y-2">
          <p className="font-medium text-lg">Top Paths</p>
          {pathsData.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ChainIcon chain={item.source_chain} />
                <ChevronRight className="mx-1 size-5" />
                <ChainIcon chain={item.destination_chain} />
              </div>
              <p className="font-medium">{formatNumber(item.amount)}</p>
            </div>
          ))}
        </div>
        <Separator orientation="vertical" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-lg">Top Sources</p>
          {sourceData.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ChainIcon chain={item.chain} />
              </div>
              <p className="font-medium">{formatNumber(item.amount)}</p>
            </div>
          ))}
        </div>
        <Separator orientation="vertical" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-lg">Top Destinations</p>
          {destinationData.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ChainIcon chain={item.chain} />
              </div>
              <p className="font-medium">{formatNumber(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TopCardSkeleton = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border p-6">
      <Skeleton className="mb-4 h-8 w-[150px]" />
      <div className="flex h-[200px] gap-5">
        <Skeleton className="h-full flex-1" />
        <Separator orientation="vertical" />
        <Skeleton className="h-full flex-1" />
        <Separator orientation="vertical" />
        <Skeleton className="h-full flex-1" />
      </div>
    </div>
  );
};
