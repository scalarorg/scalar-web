import { postMethod } from "@/features/explore/services";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { TFaucetForm } from "../schemas";

const useCreatFaucet = (
  options?: Omit<
    UseMutationOptions<null, Error, TFaucetForm, unknown>,
    "mutationKey" | "mutationFn"
  >,
) =>
  useMutation({
    mutationKey: ["faucet"],
    mutationFn: (data: TFaucetForm) =>
      postMethod<TFaucetForm, null>("faucet", data),
    ...options,
  });

export const faucetQuery = {
  mutate: {
    useCreatFaucet,
  },
};
