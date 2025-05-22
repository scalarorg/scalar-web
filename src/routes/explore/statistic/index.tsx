import LockedIcon from "@/assets/icons/locked.svg";
import TransactionIcon from "@/assets/icons/transaction.svg";
import UserIcon from "@/assets/icons/user.svg";
import { Heading, If, InputSearchBox } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { ETimeBucket, useExploreQuery } from "@/features/explore";
import {
  ChartCard,
  ChartCardSkeleton,
  RankCard,
  RankCardSkeleton,
  type TRankCardProps,
  type TTopCardProps,
  TopCard,
  TopCardSkeleton
} from "@/features/protocol";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { isEmpty } from "lodash";
import { ReactNode, useMemo } from "react";
import { z } from "zod";

export const Route = createFileRoute("/explore/statistic/")({
  component: Statistic,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS.extend({
    time_bucket: z.nativeEnum(ETimeBucket).optional()
  })
});

type TStatisticTotalData = {
  label: string;
  value: number;
  icon: ReactNode;
  unit?: string;
  className?: Partial<{
    container: string;
    contentWrapper: string;
    content: string;
    label: string;
  }>;
};

const tabs: {
  name: string;
  value: ETimeBucket;
}[] = [
  { name: "7D", value: ETimeBucket.WEEK },
  { name: "30D", value: ETimeBucket.MONTH },
  { name: "ALL", value: ETimeBucket.DAY }
];

const formatDateChart = (date: number) => formatDate(date, "DD-MM");

const NoData = () => <p className='text-center font-semibold text-2xl'>No data available</p>;

function Statistic() {
  const { useSearch, useNavigate } = Route;
  const { time_bucket } = useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useExploreQuery.useStatistic({
    time_bucket: time_bucket ?? ETimeBucket.DAY,
    size: 20
  });

  // Data
  const chartData = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Transaction",
        data: data?.txs?.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data
        })),
        chartLabel: "Transaction"
      },
      {
        title: "Volume",
        data: data?.volumes?.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data
        })),
        chartLabel: "Volume"
      },
      {
        title: "Active users",
        data: data?.active_users?.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data
        })),
        chartLabel: "Users"
      },
      {
        title: "New users",
        data: data?.new_users?.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data
        })),
        chartLabel: "Users"
      }
    ];
  }, [data]);

  const statisticData: TStatisticTotalData[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Total transactions",
        value: data?.total_txs,
        icon: <TransactionIcon />
      },
      {
        label: "Total value locked",
        value: data?.total_volumes,
        icon: <LockedIcon />,
        unit: "$"
      },
      {
        label: "Users",
        value: data?.total_users,
        icon: <UserIcon />
      }
    ];
  }, [data]);

  const rankData: TRankCardProps[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "Top Users",
        description: "Top Users by token transfers transactions",
        data: data?.top_users?.map(({ address: name, amount: value }) => ({
          name,
          value
        }))
      },
      {
        title: "Top Holder",
        description: "Top users by BTC deposits through the bridge",
        data: data?.top_bridges?.map(({ address: name, amount: value }) => ({
          name,
          value
        }))
      }
    ];
  }, [data]);

  const topCardData: TTopCardProps[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: "By transactions",
        pathsData: data?.top_paths_by_tx,
        sourceData: data?.top_source_chains_by_tx,
        destinationData: data?.top_destination_chains_by_tx
      },
      {
        title: "By volume",
        pathsData: data?.top_paths_by_volume,
        sourceData: data?.top_source_chains_by_volume,
        destinationData: data?.top_destination_chains_by_volume
      }
    ];
  }, [data]);

  const tabValue = useMemo(() => {
    if (time_bucket) {
      return tabs.find((i) => i.value === time_bucket)?.value;
    }

    return ETimeBucket.DAY;
  }, [time_bucket]);

  return (
    <div className='flex flex-col gap-8 py-15'>
      <div
        className={cn(
          // Flexbox container
          "flex items-center justify-between gap-2",

          // Apply styles to direct child div elements
          "[&>div]:w-[40%]",
          "[&>div]:max-w-172.5"
        )}
      >
        <Heading>Protocol Overview</Heading>
        <InputSearchBox placeholder='Search by protocol' className='bg-[#F7F9FF]' />
      </div>
      <div className='flex flex-col gap-8 md:flex-row'>
        <If
          condition={isLoading}
          fallback={
            <If
              condition={isEmpty(statisticData)}
              fallback={statisticData.map(({ label, value, icon, unit, className }) => (
                <div
                  key={label}
                  className={cn(
                    // Padding
                    "p-6",

                    // Border Radius
                    "rounded-lg",

                    // Background Color
                    "bg-primary",

                    // Flexbox Container
                    "flex flex-1 items-center justify-between gap-2",
                    className?.container
                  )}
                >
                  <div
                    className={cn(
                      "flex h-full flex-col gap-1 text-white uppercase",
                      className?.contentWrapper
                    )}
                  >
                    <p className={cn("font-semibold text-[40px]", className?.content)}>
                      {unit}
                      {formatNumber(value)}
                    </p>
                    <p className={cn("text-lg", className?.label)}>{label}</p>
                  </div>
                  {icon}
                </div>
              ))}
            >
              <NoData />
            </If>
          }
        >
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Skeleton key={i} className='h-37.5 flex-1' />
          ))}
        </If>
      </div>
      <div className='flex flex-col gap-8 *:data-[slot=rank-card]:flex-1 md:flex-row'>
        <If
          condition={isLoading}
          fallback={
            <If
              condition={isEmpty(rankData)}
              fallback={rankData.map((i) => <RankCard key={i.title} {...i} />)}
            >
              <NoData />
            </If>
          }
        >
          {Array.from({ length: 2 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <RankCardSkeleton key={i} />
          ))}
        </If>
      </div>
      <Tabs
        defaultValue={tabValue}
        onValueChange={(value) => {
          const newValue = value as ETimeBucket;

          return navigate({
            search: (prev) => ({
              ...prev,
              time_bucket: newValue === ETimeBucket.DAY ? undefined : newValue
            })
          });
        }}
      >
        <TabsList className='h-15 w-full justify-end gap-2 bg-background-secondary'>
          {tabs.map(({ name, value }) => (
            <TabsTrigger value={value} key={value} className='h-10 bg-white px-6 font-normal text-lg'>
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <If
          condition={isLoading}
          fallback={
            <If
              condition={isEmpty(chartData)}
              fallback={chartData.map((i) => <ChartCard key={i.title} {...i} />)}
            >
              <NoData />
            </If>
          }
        >
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <ChartCardSkeleton key={i} />
          ))}
        </If>
      </div>
      <div className='flex flex-col gap-8'>
        <If
          condition={isLoading}
          fallback={
            <If
              condition={isEmpty(topCardData)}
              fallback={topCardData.map((item) => <TopCard key={item.title} {...item} />)}
            >
              <NoData />
            </If>
          }
        >
          {Array.from({ length: 2 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TopCardSkeleton key={i} />
          ))}
        </If>
      </div>
    </div>
  );
}
