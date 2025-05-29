import { IGateway_ABI } from '@/abis/igateway';
import { useCallback, useState } from 'react';
import { useContract } from './use-contract';

interface SendTokenParams {
  destinationChain: string;
  destinationAddress: string;
  symbol: string;
  amount: bigint;
}

interface CallContractWithTokenParams {
  destinationChain: string;
  destinationContractAddress: string;
  payload: string;
  symbol: string;
  amount: bigint;
}

export const useGatewayContract = (gatewayAddress: `0x${string}`) => {
  const { contract, key } = useContract(IGateway_ABI, gatewayAddress);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const sendToken = useCallback(
    (params: SendTokenParams) => {
      if (!contract) return;
      setIsPending(true);
      try {
        return contract.sendToken?.(
          params.destinationChain,
          params.destinationAddress,
          params.symbol,
          params.amount
        );
      } catch (error) {
        setError(error as string);
      } finally {
        setIsPending(false);
      }
    },
    [contract, key]
  );

  const callContractWithToken = useCallback(
    (params: CallContractWithTokenParams) => {
      if (!contract) return;
      setIsPending(true);
      try {
        return contract.callContractWithToken?.(
          params.destinationChain,
          params.destinationContractAddress,
          params.payload,
          params.symbol,
          params.amount
        );
      } catch (error) {
        setError(error as string);
      } finally {
        setIsPending(false);
      }
    },
    [contract, key]
  );

  return {
    error,
    sendToken,
    callContractWithToken,
    isPending
  };
};
