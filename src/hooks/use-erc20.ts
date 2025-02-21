import { IERC20_ABI } from "@/abis/ierc20";
import { useCallback, useState } from "react";
import { useContract } from "./use-contract";

export const useERC20 = (tokenAddress?: `0x${string}`) => {
  const [error, setError] = useState<string | null>(null);
  const contract = useContract(IERC20_ABI, tokenAddress);

  const approve = useCallback(
    (spenderAddress: string, burnAmount: bigint) => {
      if (!contract) return;
      try {
        return contract.approve?.(spenderAddress, burnAmount);
      } catch (error) {
        setError(error as string);
      }
    },
    [contract],
  );

  const checkAllowance = useCallback(
    (ownerAddress: string, spenderAddress: string) => {
      if (!contract) return;
      return contract.allowance?.(ownerAddress, spenderAddress);
    },
    [contract],
  );

  const balanceOf = useCallback(
    (ownerAddress: string) => {
      if (!contract) return;
      return contract.balanceOf?.(ownerAddress);
    },
    [contract],
  );

  const getDecimals = useCallback(() => {
    if (!contract) return;
    return contract.decimals?.();
  }, [contract]);

  return {
    approveError: error,
    approve,
    checkAllowance,
    balanceOf,
    getDecimals,
  };
};
