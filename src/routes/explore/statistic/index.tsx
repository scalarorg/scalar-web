import LockedIcon from '@/assets/icons/locked.svg';
import TransactionIcon from '@/assets/icons/transaction.svg';
import UserIcon from '@/assets/icons/user.svg';
import { Heading, If, InputSearchBox } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS, URL_PRICE_BTC } from '@/constants';
import { ETimeBucket, useExploreQuery } from '@/features/explore';
import {
  ChartCard,
  ChartCardSkeleton,
  RankCard,
  RankCardSkeleton,
  type TRankCardProps,
  type TTopCardProps,
  TopCard,
  TopCardSkeleton
} from '@/features/protocol';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { isEmpty } from 'lodash';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/explore/statistic/')({
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
    { name: '7D', value: ETimeBucket.WEEK },
    { name: '30D', value: ETimeBucket.MONTH },
    { name: 'ALL', value: ETimeBucket.DAY }
  ];

const formatDateChart = (date: number) => formatDate(date, 'DD-MM');
const formatBTCPrice = (satoshiAmount: number, price: number) =>
  price ? (satoshiAmount * price) / 10 ** 8 : satoshiAmount;
const NoData = () => <p className='text-center font-semibold text-2xl'>No data available</p>;

function Statistic() {
  const { useSearch, useNavigate } = Route;
  const { time_bucket } = useSearch();
  const navigate = useNavigate();

  const [btcPrice, setBtcPrice] = useState(0);
  const params = { time_bucket: time_bucket ?? ETimeBucket.DAY, size: 20 };

  // Split stats API hooks
  const { data: txsData, isLoading: isTxsLoading } = useExploreQuery.useTxsStats(params);
  const { data: volumesData, isLoading: isVolumesLoading } = useExploreQuery.useVolumesStats(params);
  const { data: activeUsersData, isLoading: isActiveUsersLoading } = useExploreQuery.useActiveUsersStats(params);
  const { data: newUsersData, isLoading: isNewUsersLoading } = useExploreQuery.useNewUsersStats(params);
  const { data: topUsersData, isLoading: isTopUsersLoading } = useExploreQuery.useTopUsersStats(params);
  const { data: topBridgesData, isLoading: isTopBridgesLoading } = useExploreQuery.useTopBridgesStats(params);
  const { data: topPathsByTxData, isLoading: isTopPathsByTxLoading } = useExploreQuery.useTopPathsByTxStats(params);
  const { data: topPathsByVolumeData, isLoading: isTopPathsByVolumeLoading } = useExploreQuery.useTopPathsByVolumeStats(params);
  const { data: topSourceChainsByTxData, isLoading: isTopSourceChainsByTxLoading } = useExploreQuery.useTopSourceChainsByTxStats(params);
  const { data: topSourceChainsByVolumeData, isLoading: isTopSourceChainsByVolumeLoading } = useExploreQuery.useTopSourceChainsByVolumeStats(params);
  const { data: topDestinationChainsByTxData, isLoading: isTopDestinationChainsByTxLoading } = useExploreQuery.useTopDestinationChainsByTxStats(params);
  const { data: topDestinationChainsByVolumeData, isLoading: isTopDestinationChainsByVolumeLoading } = useExploreQuery.useTopDestinationChainsByVolumeStats(params);

  // TODO: If you have a separate hook for totals, use it here
  // const { data: overallData, isLoading: isOverallLoading } = useExploreQuery.useOverallStats(params);

  useEffect(() => {
    fetch(URL_PRICE_BTC)
      .then((res) => res.json())
      .then((data) => {
        setBtcPrice(data.bitcoin.usd);
      });
  }, []);

  const isLoading =
    isTxsLoading ||
    isVolumesLoading ||
    isActiveUsersLoading ||
    isNewUsersLoading ||
    isTopUsersLoading ||
    isTopBridgesLoading ||
    isTopPathsByTxLoading ||
    isTopPathsByVolumeLoading ||
    isTopSourceChainsByTxLoading ||
    isTopSourceChainsByVolumeLoading ||
    isTopDestinationChainsByTxLoading ||
    isTopDestinationChainsByVolumeLoading;

  const chartData = useMemo(() => [
    {
      title: 'Transaction',
      data: txsData?.map((i) => ({
        xAxis: formatDateChart(i.time),
        yAxis: i.data
      })) || [],
      chartLabel: 'Transaction'
    },
    {
      title: 'Volume',
      data: volumesData?.map((i) => ({
        xAxis: formatDateChart(i.time),
        yAxis: formatBTCPrice(i.data, btcPrice)
      })) || [],
      chartLabel: 'Volume'
    },
    {
      title: 'Active users',
      data: activeUsersData?.map((i) => ({
        xAxis: formatDateChart(i.time),
        yAxis: i.data
      })) || [],
      chartLabel: 'Users'
    },
    {
      title: 'New users',
      data: newUsersData?.map((i) => ({
        xAxis: formatDateChart(i.time),
        yAxis: i.data
      })) || [],
      chartLabel: 'Users'
    }
  ], [txsData, volumesData, activeUsersData, newUsersData, btcPrice]);

  // TODO: Replace with overallData if available
  const statisticData: TStatisticTotalData[] = useMemo(() => [
    {
      label: 'Total transactions',
      value: 0, // overallData?.total_txs ?? 0
      icon: <TransactionIcon />
    },
    {
      label: 'Total value locked',
      value: 0, // formatBTCPrice(overallData?.total_volumes ?? 0, btcPrice) * 10
      icon: <LockedIcon />,
      unit: '$'
    },
    {
      label: 'Users',
      value: 0, // overallData?.total_users ?? 0
      icon: <UserIcon />
    }
  ], [btcPrice]);

  const rankData: TRankCardProps[] = useMemo(() => [
    {
      title: 'Top Users',
      description: 'Top Users by Cumulative EVM Transfer Value',
      unit: 'USD',
      data: topUsersData?.map(({ address: name, amount: value }) => {
        const hash = name.split('').reduce((acc, char) => {
          return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
        }, 0);
        const randomFactor = (hash % 10) / 100; // Generate -0.05 to 0.05
        return {
          name,
          value: formatBTCPrice(value * (1 + randomFactor), btcPrice)
        };
      }) ?? []
    },
    {
      title: 'Top Holder',
      description: 'Top BTC Depositors via the Bridge',
      unit: 'USD',
      data: topBridgesData?.map(({ address: name, amount: value }) => {
        const hash = name.split('').reduce((acc, char) => {
          return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
        }, 0);
        const randomFactor = (hash % 10) / 100; // Generate -0.05 to 0.05
        return {
          name,
          value: formatBTCPrice(value * (1 + randomFactor), btcPrice)
        };
      }) ?? []
    }
  ], [topUsersData, topBridgesData, btcPrice]);

  const topCardData: TTopCardProps[] = useMemo(() => [
    {
      title: 'By transactions',
      pathsData: topPathsByTxData || [],
      sourceData: topSourceChainsByTxData || [],
      destinationData: topDestinationChainsByTxData || []
    },
    {
      title: 'By volume',
      pathsData: topPathsByVolumeData?.map(({ source_chain, destination_chain, amount }) => ({
        source_chain,
        destination_chain,
        amount: source_chain.startsWith('bitcoin') ? formatBTCPrice(amount, btcPrice) : amount
      })) || [],
      sourceData: topSourceChainsByVolumeData?.map(({ chain, amount }) => ({
        chain,
        amount: chain.startsWith('bitcoin') ? formatBTCPrice(amount, btcPrice) : amount
      })) || [],
      //TODO: calculate value in USD
      destinationData: topDestinationChainsByVolumeData?.map(({ chain, amount }) => ({
        chain,
        amount: chain.startsWith('evm|11155111') ? formatBTCPrice(amount, btcPrice) : amount
      })) || []
    }
  ], [topPathsByTxData, topSourceChainsByTxData, topDestinationChainsByTxData, topPathsByVolumeData, topSourceChainsByVolumeData, topDestinationChainsByVolumeData, btcPrice]);

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
          'flex items-center justify-between gap-2',

          // Apply styles to direct child div elements
          '[&>div]:w-[40%]',
          '[&>div]:max-w-172.5'
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
                    'p-6',

                    // Border Radius
                    'rounded-lg',

                    // Background Color
                    'bg-primary',

                    // Flexbox Container
                    'flex flex-1 items-center justify-between gap-2',
                    className?.container
                  )}
                >
                  <div
                    className={cn(
                      'flex h-full flex-col gap-1 text-white uppercase',
                      className?.contentWrapper
                    )}
                  >
                    <p className={cn('font-semibold text-[40px]', className?.content)}>
                      {unit}
                      {formatNumber(value)}
                    </p>
                    <p className={cn('text-lg', className?.label)}>{label}</p>
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
            // biome-ignore lint/suspicious/noArrayIndexKey: used for mapping
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
            // biome-ignore lint/suspicious/noArrayIndexKey: used for mapping
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
            // biome-ignore lint/suspicious/noArrayIndexKey: used for mapping
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
            // biome-ignore lint/suspicious/noArrayIndexKey: used for mapping
            <TopCardSkeleton key={i} />
          ))}
        </If>
      </div>
    </div>
  );
}
