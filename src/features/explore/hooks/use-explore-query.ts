import { useQuery } from "@tanstack/react-query";
import {
  TExploreList,
  TExploreParams,
  TExploreStatisticData,
  TExploreStatisticParams,
} from "../models";
import { getByGetMethod, getByPostMethod } from "../services";

const useList = (params: TExploreParams) =>
  useQuery({
    queryKey: ["explore", params],
    queryFn: () => getByPostMethod<TExploreParams, TExploreList>("x", params),
  });

const useStatistic = (params: TExploreStatisticParams) =>
  useQuery({
    queryKey: ["explore", "stats", params],
    queryFn: () =>
      getByGetMethod<TExploreStatisticParams, TExploreStatisticData>(
        "stats",
        params,
      ),
  });

export const useExploreQuery = {
  useList,
  useStatistic,
};
