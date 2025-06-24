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
  TStatisticDestinationItem
} from '../models';
import { getByGetMethod, getByPostMethod } from '../services';

const defaultStatsParams: TExploreStatisticParams = {
  size: COMMON_DEFAULT_PAGE_SIZE,
  time_bucket: ETimeBucket.DAY
};

const useTxsStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'txs', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/txs', params)
  });

const useVolumesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'volumes', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/volumes', params)
  });

const useActiveUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'active-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/active-users', params)
  });

const useNewUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'new-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticChartItem[]>('stats/new-users', params)
  });

const useTopUsersStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-users', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/top-users', params)
  });

const useTopBridgesStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-bridges', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticRankItem[]>('stats/top-bridges', params)
  });

const useTopPathsByTxStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/top-paths-by-tx', params)
  });

const useTopPathsByVolumeStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-paths-by-volume', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticPathItem[]>('stats/top-paths-by-volume', params)
  });

const useTopSourceChainsByTxStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>('stats/top-source-chains-by-tx', params)
  });

const useTopSourceChainsByVolumeStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-source-chains-by-volume', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticSourceItem[]>('stats/top-source-chains-by-volume', params)
  });

const useTopDestinationChainsByTxStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains-by-tx', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>('stats/top-destination-chains-by-tx', params)
  });

const useTopDestinationChainsByVolumeStats = (params: TExploreStatisticParams = defaultStatsParams) =>
  useQuery({
    queryKey: ['explore', 'stats', 'top-destination-chains-by-volume', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TStatisticDestinationItem[]>('stats/top-destination-chains-by-volume', params)
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

export const useExploreQuery = {
  useList,
  useTxsStats,
  useVolumesStats,
  useActiveUsersStats,
  useNewUsersStats,
  useTopUsersStats,
  useTopBridgesStats,
  useTopPathsByTxStats,
  useTopPathsByVolumeStats,
  useTopSourceChainsByTxStats,
  useTopSourceChainsByVolumeStats,
  useTopDestinationChainsByTxStats,
  useTopDestinationChainsByVolumeStats,
  useDetail
};
