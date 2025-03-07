import { useQuery } from "@tanstack/react-query";
import { TExploreList, TExploreParams } from "../models";
import { getByPostMethod } from "../services";

const useList = (params: TExploreParams) =>
  useQuery({
    queryKey: ["explore", params],
    queryFn: () => getByPostMethod<TExploreParams, TExploreList>("x", params),
  });

export const useExploreQuery = {
  useList,
};
