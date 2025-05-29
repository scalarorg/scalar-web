import { IERC20_ABI } from '@/abis/ierc20';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useChainId } from 'wagmi';
import { useContract } from './use-contract';

export const useERC20 = (tokenAddress?: `0x${string}`) => {
  const [error, setError] = useState<string | null>(null);
  const { contract, key } = useContract(IERC20_ABI, tokenAddress);
  const chainId = useChainId();

  const approve = useCallback(
    (spenderAddress: string, burnAmount: bigint) => {
      if (!contract) return;
      try {
        return contract.approve?.(spenderAddress, burnAmount);
      } catch (error) {
        setError(error as string);
      }
    },
    [contract, key]
  );

  const checkAllowance = useCallback(
    (ownerAddress: string, spenderAddress: string) => {
      if (!contract) return;
      return contract.allowance?.(ownerAddress, spenderAddress);
    },
    [contract, key]
  );

  const balanceOf = useCallback(
    async (ownerAddress: string) => {
      if (!contract) throw Error('No contract');
      const balance = contract.balanceOf?.(ownerAddress);
      return balance;
    },
    [contract, key]
  );

  const { data: decimals } = useQuery({
    queryKey: ['decimals', tokenAddress, chainId, key],
    queryFn: () => contract?.decimals?.(),
    enabled: !!contract && !!chainId
  });

  return {
    approveError: error,
    approve,
    checkAllowance,
    balanceOf,
    decimals
  };
};
