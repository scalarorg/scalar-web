import { COMMON_DEFAULT_PAGE_SIZE } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import {
  ETimeBucket,
  TExploreDetail,
  TExploreList,
  TExploreParams,
  TExploreStatisticParams,
  TStatisticChartItem,
  TStatisticRankItem,
  TStatisticPathItem,
  TStatisticSourceItem,
  TStatisticDestinationItem,
  TSummaryStats
} from '../models';
import { getByGetMethod, getByPostMethod } from '../services';

const defaultStatsParams: TExploreStatisticParams = {
  size: COMMON_DEFAULT_PAGE_SIZE,
  time_bucket: ETimeBucket.DAY
};

// Volume api
const useTopUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/volume/top-users', params)
  });

const useTopBridgesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-bridges', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/volume/top-bridges', params)
  });

const useTopSourceChainsByVolume = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>('stats/volume/top-source-chains', params)
  });

const useTopDestinationChainsByVolume = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>('stats/volume/top-destination-chains', params)
  });

const useTopPathsByVolume = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/volume/top-paths', params)
  });


// Transaction api

const useTopSourceChainsByTx = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>('stats/transaction/top-source-chains', params)
  });

const useTopDestinationChainsByTx = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>('stats/transaction/top-destination-chains', params)
  });

const useTopPathsByTx = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/transaction/top-paths', params)
  });


// Chart api
const useTxsStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'txs', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/txs', params)
  });

const useVolumesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'volumes', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/volumes', params)
  });

const useActiveUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'active-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/active-users', params)
  });

const useNewUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'new-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/chart/new-users', params)
  });

const useList = (params: TExploreParams) =>
  useQuery({
    queryKey: ['explore', 'x', params],
    queryFn: () => getByPostMethod<TExploreParams, TExploreList>('x', params)
  });

const useDetail = (id: string, type: 'bridge' | 'transfer' | 'redeem') =>
  useQuery({
    queryKey: ['explore', 'x', type, id],
    queryFn: () => getByGetMethod<Record<string, string>, TExploreDetail>(`x/${type}/${id}`, {})
  });

const useSummaryStats = () =>
  useQuery({
    queryKey: ['explore', 'stats', 'summary'],
    queryFn: () => getByGetMethod<Record<string, string>, TSummaryStats>('stats/summary', {})
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
