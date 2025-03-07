import { useQuery } from "@tanstack/react-query";
import { TExploreBridgeList, TExploreBridgeParams } from "../models";
import { getByPostMethod } from "../services";

const useList = (params: TExploreBridgeParams) => {
  const newParams = {
    ...params,
    type: "bridge",
  };

  return useQuery({
    queryKey: ["explore-bridge", newParams],
    queryFn: () =>
      getByPostMethod<TExploreBridgeParams, TExploreBridgeList>("x", newParams),
  });
};

export const useExploreBridgeQuery = {
  useList,
};
