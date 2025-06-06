import { COMMON_DEFAULT_PAGE_SIZE } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import {
  ETimeBucket,
  TExploreDetail,
  TExploreList,
  TExploreParams,
  TExploreStatisticData,
  TExploreStatisticParams
} from '../models';
import { getByGetMethod, getByPostMethod } from '../services';

const useList = (params: TExploreParams) =>
  useQuery({
    queryKey: ['explore', 'x', params],
    queryFn: () => getByPostMethod<TExploreParams, TExploreList>('x', params)
  });

const useStatistic = (
  params: TExploreStatisticParams = {
    size: COMMON_DEFAULT_PAGE_SIZE,
    time_bucket: ETimeBucket.DAY
  }
) =>
  useQuery({
    queryKey: ['explore', 'stats', params],
    queryFn: () => getByGetMethod<TExploreStatisticParams, TExploreStatisticData>('stats', params)
  });

const useDetail = (id: string, type: 'bridge' | 'transfer' | 'redeem') =>
  useQuery({
    queryKey: ['explore', 'x', type, id],
    queryFn: () => getByGetMethod<Record<string, string>, TExploreDetail>(`x/${type}/${id}`, {})
  });
export const useExploreQuery = {
  useList,
  useStatistic,
  useDetail
};
