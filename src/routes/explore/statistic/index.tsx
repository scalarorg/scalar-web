import LockedIcon from '@/assets/icons/locked.svg';
import TransactionIcon from '@/assets/icons/transaction.svg';
import UserIcon from '@/assets/icons/user.svg';
import { Heading, InputSearchBox } from '@/components/common';
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
import { useProgressiveLoading } from '@/hooks/use-progressive-loading';
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

  // Priority 1: Critical data (Summary, Top Users/Bridges, Core Charts)
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isSuccess: summarySuccess
  } = useExploreQuery.useSummaryStats();
  const {
    data: topUsersData,
    isLoading: isTopUsersLoading,
    isSuccess: topUsersSuccess
  } = useExploreQuery.useTopUsersStats(params);
  const {
    data: topBridgesData,
    isLoading: isTopBridgesLoading,
    isSuccess: topBridgesSuccess
  } = useExploreQuery.useTopBridgesStats(params);
  const {
    data: txsData,
    isLoading: isTxsLoading,
    isSuccess: txsSuccess
  } = useExploreQuery.useTxsStats(params);
  const {
    data: volumesData,
    isLoading: isVolumesLoading,
    isSuccess: volumesSuccess
  } = useExploreQuery.useVolumesStats(params);

  // Progressive loading logic
  const primaryDataLoaded =
    summarySuccess && topUsersSuccess && topBridgesSuccess && txsSuccess && volumesSuccess;
  const { loadSecondaryData, loadTertiaryData, loadingProgress } = useProgressiveLoading({
    primaryDataLoaded,
    secondaryDelay: 100,
    tertiaryDelay: 300
  });

  // Priority 2: Secondary data (Additional charts)
  const { data: activeUsersData, isLoading: isActiveUsersLoading } = useExploreQuery.useActiveUsersStats(
    params,
    loadSecondaryData
  );
  const { data: newUsersData, isLoading: isNewUsersLoading } = useExploreQuery.useNewUsersStats(
    params,
    loadSecondaryData
  );

  // Priority 3: Tertiary data (Volume chains and paths)
  const { data: topSourceChainsByVolumeData, isLoading: isTopSourceChainsByVolumeLoading } =
    useExploreQuery.useTopSourceChainsByVolume(params, loadTertiaryData);
  const { data: topDestinationChainsByVolumeData, isLoading: isTopDestinationChainsByVolumeLoading } =
    useExploreQuery.useTopDestinationChainsByVolume(params, loadTertiaryData);
  const { data: topPathsByVolumeData, isLoading: isTopPathsByVolumeLoading } =
    useExploreQuery.useTopPathsByVolume(params, loadTertiaryData);

  // Priority 4: Transaction data (lowest priority)
  const { data: topSourceChainsByTxData, isLoading: isTopSourceChainsByTxLoading } =
    useExploreQuery.useTopSourceChainsByTx(params, loadTertiaryData);
  const { data: topDestinationChainsByTxData, isLoading: isTopDestinationChainsByTxLoading } =
    useExploreQuery.useTopDestinationChainsByTx(params, loadTertiaryData);
  const { data: topPathsByTxData, isLoading: isTopPathsByTxLoading } = useExploreQuery.useTopPathsByTx(
    params,
    loadTertiaryData
  );

  // TODO: If you have a separate hook for totals, use it here
  // const { data: overallData, isLoading: isOverallLoading } = useExploreQuery.useOverallStats(params);

  useEffect(() => {
    fetch(URL_PRICE_BTC)
      .then((res) => res.json())
      .then((data) => {
        setBtcPrice(data.bitcoin.usd);
      })
      .catch(() => {
        // Fallback BTC price if API fails
        setBtcPrice(50000);
      });
  }, []);

  // Primary charts (always available)
  const primaryChartData = useMemo(
    () => [
      {
        title: 'Transaction',
        data:
          txsData?.map((i) => ({
            xAxis: formatDateChart(i.time),
            yAxis: i.data
          })) || [],
        chartLabel: 'Transaction'
      },
      {
        title: 'Volume',
        data:
          volumesData?.map((i) => ({
            xAxis: formatDateChart(i.time),
            yAxis: formatBTCPrice(i.data, btcPrice)
          })) || [],
        chartLabel: 'Volume'
      }
    ],
    [txsData, volumesData, btcPrice]
  );

  // Secondary charts (load after primary)
  const secondaryChartData = useMemo(
    () => [
      {
        title: 'Active users',
        data:
          activeUsersData?.map((i) => ({
            xAxis: formatDateChart(i.time),
            yAxis: i.data
          })) || [],
        chartLabel: 'Users'
      },
      {
        title: 'New users',
        data:
          newUsersData?.map((i) => ({
            xAxis: formatDateChart(i.time),
            yAxis: i.data
          })) || [],
        chartLabel: 'Users'
      }
    ],
    [activeUsersData, newUsersData]
  );

  // Combined chart data for rendering
  // const chartData = useMemo(() => {
  //   const charts = [...primaryChartData];
  //   if (loadSecondaryData) {
  //     charts.push(...secondaryChartData);
  //   }
  //   return charts;
  // }, [primaryChartData, secondaryChartData, loadSecondaryData]);

  // TODO: Replace with overallData if available
  const statisticData: TStatisticTotalData[] = useMemo(
    () => [
      {
        label: 'Total transactions',
        value: summaryData?.total_txs ?? 0, // overallData?.total_txs ?? 0
        icon: <TransactionIcon />
      },
      {
        label: 'Total value locked',
        value: formatBTCPrice(summaryData?.total_volumes ?? 0, btcPrice) * 10,
        icon: <LockedIcon />,
        unit: '$'
      },
      {
        label: 'Users',
        value: summaryData?.total_users ?? 0,
        icon: <UserIcon />
      }
    ],
    [btcPrice, summaryData]
  );

  const rankData: TRankCardProps[] = useMemo(
    () => [
      {
        title: 'Top Users',
        description: 'Top Users by Cumulative EVM Transfer Value',
        unit: 'USD',
        data:
          topUsersData?.map(({ address: name, amount: value }) => {
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
        data:
          topBridgesData?.map(({ address: name, amount: value }) => {
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
    ],
    [topUsersData, topBridgesData, btcPrice]
  );

  const topCardData: TTopCardProps[] = useMemo(
    () => [
      {
        title: 'By transactions',
        pathsData: topPathsByTxData || [],
        sourceData: topSourceChainsByTxData || [],
        destinationData: topDestinationChainsByTxData || []
      },
      {
        title: 'By volume',
        pathsData:
          topPathsByVolumeData?.map(({ source_chain, destination_chain, amount }) => ({
            source_chain,
            destination_chain,
            amount: source_chain.startsWith('bitcoin') ? formatBTCPrice(amount, btcPrice) : amount
          })) || [],
        sourceData:
          topSourceChainsByVolumeData?.map(({ chain, amount }) => ({
            chain,
            amount: chain.startsWith('bitcoin') ? formatBTCPrice(amount, btcPrice) : amount
          })) || [],
        //TODO: calculate value in USD
        destinationData:
          topDestinationChainsByVolumeData?.map(({ chain, amount }) => ({
            chain,
            amount: chain.startsWith('evm|11155111') ? formatBTCPrice(amount, btcPrice) : amount
          })) || []
      }
    ],
    [
      topPathsByTxData,
      topSourceChainsByTxData,
      topDestinationChainsByTxData,
      topPathsByVolumeData,
      topSourceChainsByVolumeData,
      topDestinationChainsByVolumeData,
      btcPrice
    ]
  );

  const tabValue = useMemo(() => {
    if (time_bucket) {
      return tabs.find((i) => i.value === time_bucket)?.value;
    }

    return ETimeBucket.DAY;
  }, [time_bucket]);

  // const isLoading = isSummaryLoading || isTopUsersLoading || isTopBridgesLoading || isTopSourceChainsByVolumeLoading || isTopDestinationChainsByVolumeLoading || isTopPathsByVolumeLoading || isTopSourceChainsByTxLoading || isTopDestinationChainsByTxLoading || isTopPathsByTxLoading || isTxsLoading || isVolumesLoading || isActiveUsersLoading || isNewUsersLoading

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
        <div className='flex flex-col gap-2'>
          <Heading>Protocol Overview</Heading>
          {loadingProgress < 100 && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <div className='w-32 h-1 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-primary transition-all duration-300 ease-out'
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span>Loading data... {loadingProgress}%</span>
            </div>
          )}
        </div>
        <InputSearchBox placeholder='Search by protocol' className='bg-[#F7F9FF]' />
      </div>
      <div className='flex flex-col gap-8 md:flex-row'>
        {isSummaryLoading ? (
          Array.from({ length: 3 }).map((item, i) => (
            <Skeleton key={`summary-${item}-${i}`} className='h-37.5 flex-1' />
          ))
        ) : summaryData ? (
          statisticData.map(({ label, value, icon, unit, className }) => (
            <div
              key={label}
              className={cn(
                'p-6 rounded-lg bg-primary flex flex-1 items-center justify-between gap-2 transition-all duration-300 ease-in-out',
                className?.container
              )}
            >
              <div
                className={cn('flex h-full flex-col gap-1 text-white uppercase', className?.contentWrapper)}
              >
                <p className={cn('font-semibold text-[40px]', className?.content)}>
                  {unit}
                  {formatNumber(value)}
                </p>
                <p className={cn('text-lg', className?.label)}>{label}</p>
              </div>
              {icon}
            </div>
          ))
        ) : (
          <NoData />
        )}
      </div>
      <div className='flex flex-col gap-8 *:data-[slot=rank-card]:flex-1 md:flex-row'>
        {isTopUsersLoading || isTopBridgesLoading ? (
          Array.from({ length: 2 }).map((item, i) => <RankCardSkeleton key={`${item}-${i}`} />)
        ) : !isEmpty(rankData) ? (
          rankData.map((i) => (
            <div key={i.title} className='flex-grow transition-all duration-300 ease-in-out'>
              <RankCard {...i} />
            </div>
          ))
        ) : (
          <NoData />
        )}
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
        {/* Primary charts - show immediately when loaded */}
        {primaryChartData.map((chart, index) => (
          <div key={chart.title} className='transition-all duration-300 ease-in-out transform'>
            {(index === 0 && isTxsLoading) || (index === 1 && isVolumesLoading) ? (
              <ChartCardSkeleton />
            ) : (
              <div className='animate-in fade-in-50 slide-in-from-bottom-4 duration-500'>
                <ChartCard {...chart} />
              </div>
            )}
          </div>
        ))}

        {/* Secondary charts - show when secondary data is enabled */}
        {loadSecondaryData &&
          secondaryChartData.map((chart, index) => (
            <div key={chart.title} className='transition-all duration-300 ease-in-out transform'>
              {(index === 0 && isActiveUsersLoading) || (index === 1 && isNewUsersLoading) ? (
                <ChartCardSkeleton />
              ) : (
                <div
                  className='animate-in fade-in-50 slide-in-from-bottom-4 duration-500'
                  style={{ animationDelay: `${index * 100} ms` }}
                >
                  <ChartCard {...chart} />
                </div>
              )}
            </div>
          ))}

        {/* Show skeletons for secondary charts if not loaded yet */}
        {!loadSecondaryData &&
          Array.from({ length: 2 }).map((item, i) => (
            <div key={`secondary - skeleton - ${item}-${i}`} className='opacity-60'>
              <ChartCardSkeleton />
            </div>
          ))}
      </div>
      <div className='flex flex-col gap-8'>
        {loadTertiaryData ? (
          isTopPathsByTxLoading ||
          isTopSourceChainsByTxLoading ||
          isTopDestinationChainsByTxLoading ||
          isTopPathsByVolumeLoading ||
          isTopSourceChainsByVolumeLoading ||
          isTopDestinationChainsByVolumeLoading ? (
            Array.from({ length: 2 }).map((item, i) => <TopCardSkeleton key={`${item}-${i}`} />)
          ) : !isEmpty(topCardData) ? (
            topCardData.map((item, index) => (
              <div
                key={item.title}
                className='animate-in fade-in-50 slide-in-from-bottom-6 duration-700'
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <TopCard {...item} />
              </div>
            ))
          ) : (
            <NoData />
          )
        ) : (
          Array.from({ length: 2 }).map((item, i) => (
            <div key={`${item}-${i}`} className='opacity-50'>
              <TopCardSkeleton />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
