import { COMMON_DEFAULT_PAGE_SIZE } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import {
  ETimeBucket,
  TExploreDetail,
  TExploreList,
  TExploreParams,
  TExploreStatisticParams,
  TStatisticChartItem,
  TStatisticDestinationItem,
  TStatisticPathItem,
  TStatisticRankItem,
  TStatisticSourceItem,
  TSummaryStats
} from '../models';
import { getByGetMethod } from '../services';

const defaultStatsParams: TExploreStatisticParams = {
  size: COMMON_DEFAULT_PAGE_SIZE,
  time_bucket: ETimeBucket.DAY
};

// Volume api - High priority queries (load first)
const useTopUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-users', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/volume/top-users', params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

const useTopBridgesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-bridges', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/volume/top-bridges', params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useTopSourceChainsByVolume = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>(
        'stats/volume/top-source-chains',
        params
      ),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useTopDestinationChainsByVolume = (
  params: TExploreStatisticParams = defaultStatsParams,
  enabled = true
) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>(
        'stats/volume/top-destination-chains',
        params
      ),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useTopPathsByVolume = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/volume/top-paths', params),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

// Transaction api - Medium priority queries

const useTopSourceChainsByTx = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains-by-tx', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>(
        'stats/transaction/top-source-chains',
        params
      ),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useTopDestinationChainsByTx = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains-by-tx', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>(
        'stats/transaction/top-destination-chains',
        params
      ),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useTopPathsByTx = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths-by-tx', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/transaction/top-paths', params),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false
  });

// Chart api - High priority queries (load first)
const useTxsStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'txs', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/txs', params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

const useVolumesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'volumes', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/volumes', params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useActiveUsersStats = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'active-users', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/active-users', params),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useNewUsersStats = (params: TExploreStatisticParams = defaultStatsParams, enabled = true) =>
  useQuery({
    queryKey: ['explore', 'stats', 'new-users', params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/new-users', params),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

const useList = (params: TExploreParams) =>
  useQuery({
    queryKey: ['explore', 'x', params],
    queryFn: () => getByGetMethod<TExploreParams, TExploreList>('x', params)
  });

const useDetail = (id: string, type: 'bridge' | 'transfer' | 'redeem') =>
  useQuery({
    queryKey: ['explore', 'x', type, id],
    queryFn: () => getByGetMethod<Record<string, string>, TExploreDetail>(`x/${type}/${id}`, {})
  });

const useSummaryStats = () =>
  useQuery({
    queryKey: ['explore', 'stats', 'summary'],
    queryFn: () => getByGetMethod<Record<string, string>, TSummaryStats>('stats/summary', {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

export const useExploreQuery = {
  useSummaryStats,

  useTopUsersStats,
  useTopBridgesStats,
  useTopSourceChainsByVolume,
  useTopDestinationChainsByVolume,
  useTopPathsByVolume,

  useTopSourceChainsByTx,
  useTopDestinationChainsByTx,
  useTopPathsByTx,

  useTxsStats,
  useVolumesStats,
  useActiveUsersStats,
  useNewUsersStats,

  useList,
  useDetail
};
