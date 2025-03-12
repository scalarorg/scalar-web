import LockedIcon from "@/assets/icons/locked.svg";
import TransactionIcon from "@/assets/icons/transaction.svg";
import UserIcon from "@/assets/icons/user.svg";
import { Heading, InputSearchBox } from "@/components/common";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { ETimeBucket, useExploreQuery } from "@/features/explore";
import {
  ChartCard,
  ChartCardSkeleton,
  RankCard,
  type TCompareData,
  type TInfoData,
  type TRankCardProps,
  type TRankItem,
  type TTopCardProps,
  TopCard,
} from "@/features/protocol";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { isEmpty } from "lodash";
import { ReactNode, useMemo } from "react";
import { z } from "zod";

export const Route = createFileRoute("/explore/statistic/")({
  component: Statistic,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS.extend({
    time_bucket: z.nativeEnum(ETimeBucket).optional(),
  }),
});

const statisticData: {
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
}[] = [
  {
    label: "Total transactions",
    value: 1000000,
    icon: <TransactionIcon />,
    unit: "$",
  },
  {
    label: "Total value locked",
    value: 1000000,
    icon: <LockedIcon />,
    unit: "$",
  },
  {
    label: "Users",
    value: 1000000,
    icon: <UserIcon />,
  },
];

const tabs: {
  name: string;
  value: ETimeBucket;
}[] = [
  { name: "7D", value: ETimeBucket.WEEK },
  { name: "30D", value: ETimeBucket.MONTH },
  { name: "ALL", value: ETimeBucket.DAY },
];

// Fake data for RankCard
const fakeData = (): TRankItem[] =>
  Array.from({ length: 10 }, (_, i) => ({
    name: `User ${i + 1}`,
    value: Math.floor(Math.random() * 1000000),
  }));

const rankData: TRankCardProps[] = [
  {
    title: "Top Users",
    description: "Top Users by token transfers transactions",
    data: fakeData(),
  },
  {
    title: "Top Holder",
    description: "Top users by BTC deposits through the bridge",
    data: fakeData(),
  },
];

// Fake data for TopCard
const fakeDataTypeCompare = (): TCompareData[] =>
  Array.from({ length: Math.floor(Math.random() * 6) }, () => ({
    largeAvatar: "",
    smallAvatar: "",
    value: Math.floor(Math.random() * 1000000),
  }));

const fakeDataTypeInfo = (): TInfoData[] =>
  Array.from({ length: Math.floor(Math.random() * 6) }, (_, i) => ({
    avatar: "",
    name: `Avt ${i + 1}`,
    value: Math.floor(Math.random() * 1000000),
  }));

const topCardData: TTopCardProps[] = [
  {
    title: "Top Paths",
    description: "by transactions",
    type: "compare",
    data: fakeDataTypeCompare(),
  },
  {
    title: "Top Sources",
    description: "by transactions",
    type: "info",
    data: fakeDataTypeInfo(),
  },
  {
    title: "Top Destinations",
    description: "by transactions",
    type: "info",
    data: fakeDataTypeInfo(),
  },
  {
    title: "Top Paths",
    description: "by volume",
    type: "compare",
    data: fakeDataTypeCompare(),
  },
  {
    title: "Top Sources",
    description: "by volume",
    type: "info",
    data: fakeDataTypeInfo(),
  },
  {
    title: "Top Destinations",
    description: "by volume",
    type: "info",
    data: fakeDataTypeInfo(),
  },
];

const formatDateChart = (date: number) => formatDate(date, "DD-MM");

function Statistic() {
  const { useSearch, useNavigate } = Route;
  const { time_bucket } = useSearch();
  const navigate = useNavigate();

  const { data: chart, isLoading: isLoadingChart } =
    useExploreQuery.useStatistic({
      time_bucket: time_bucket ?? ETimeBucket.DAY,
    });

  const chartData = useMemo(() => {
    if (!chart) return [];

    return [
      {
        title: "Transaction",
        data: chart.txs.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data,
        })),
        chartLabel: "Transaction",
      },
      {
        title: "Volume",
        data: chart.volumes.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data,
        })),
        chartLabel: "Volume",
      },
      {
        title: "Active users",
        data: chart.active_users.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data,
        })),
        chartLabel: "Users",
      },
      {
        title: "New users",
        data: chart.new_users.map((i) => ({
          xAxis: formatDateChart(i.time),
          yAxis: i.data,
        })),
        chartLabel: "Users",
      },
    ];
  }, [chart]);

  const tabValue = useMemo(() => {
    if (time_bucket) {
      return tabs.find((i) => i.value === time_bucket)?.value;
    }

    return ETimeBucket.DAY;
  }, [time_bucket]);

  return (
    <div className="flex flex-col gap-8 py-[60px]">
      <div
        className={cn(
          // Flexbox container
          "flex items-center justify-between gap-2",

          // Apply styles to direct child div elements
          "[&>div]:w-[40%]",
          "[&>div]:max-w-[690px]",
        )}
      >
        <Heading>Protocol Overview</Heading>
        <InputSearchBox
          placeholder="Search by protocol"
          className="bg-[#F7F9FF]"
        />
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        {statisticData.map(({ label, value, icon, unit, className }) => (
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
              className?.container,
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-1 text-white uppercase",
                className?.contentWrapper,
              )}
            >
              <p
                className={cn("font-semibold text-[40px]", className?.content)}
              >
                {unit}
                {formatNumber(value)}
              </p>
              <p className={cn("text-lg", className?.label)}>{label}</p>
            </div>
            {icon}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-8 *:data-[slot=rank-card]:flex-1 md:flex-row">
        {rankData.map((i) => (
          <RankCard key={i.title} {...i} />
        ))}
      </div>
      <Tabs
        defaultValue={tabValue}
        onValueChange={(value) => {
          const newValue = value as ETimeBucket;

          return navigate({
            search: (prev) => ({
              ...prev,
              time_bucket: newValue === ETimeBucket.DAY ? undefined : newValue,
            }),
          });
        }}
      >
        <TabsList className="h-[60px] w-full justify-end gap-2 bg-[#F6F8FF]">
          {tabs.map(({ name, value }) => (
            <TabsTrigger
              value={value}
              key={value}
              className="h-10 bg-white px-6 font-normal text-lg"
            >
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {isLoadingChart ? (
          Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <ChartCardSkeleton key={i} />
          ))
        ) : isEmpty(chartData) ? (
          <p className="text-center font-semibold text-2xl">
            No data available
          </p>
        ) : (
          chartData.map((i) => <ChartCard key={i.title} {...i} />)
        )}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {topCardData.map((item) => (
          <TopCard key={`${item.title}-${item.type}`} {...item} />
        ))}
      </div>
    </div>
  );
}
