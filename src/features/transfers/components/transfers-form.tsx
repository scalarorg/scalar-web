import { IGateway_ABI } from "@/abis/igateway";
import { Base64Icon, ChainIcon, If, SelectSearch } from "@/components/common";
import { ConnectEvm } from "@/components/connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useERC20, useGateway, useGatewayContract, useScalarProtocols } from "@/hooks";
import { Chains } from "@/lib/chains";
import { getChainID, handleTokenApproval, isBtcChain, isEvmChain, validateTransferConfig } from "@/lib/utils";
import { getWagmiChain, isSupportedChain } from "@/lib/wagmi";
import { useWalletProvider } from "@/providers/wallet-provider";
import { SupportedChains } from "@/types/chains";
import { TProtocolDetails } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { isNil, keyBy } from "lodash";
import { ArrowRightLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import { Hex, decodeErrorResult, formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TTransfersForm, transfersFormSchema } from "../schemas";

const MIN_EVM = 2;

const filterEvmChains = (chains: TProtocolDetails["chains"] = []) => chains.filter((c) => isEvmChain(c));

export const TransfersForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const { address: evmAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    data: { protocols = [] } = {}
  } = useScalarProtocols();
  const { networkConfig } = useWalletProvider();
  const filterProtocols = protocols.filter((p) => filterEvmChains(p.chains).length >= MIN_EVM);
  const keyByFilterProtocols = keyBy(filterProtocols, "scalar_address");

  const form = useForm<TTransfersForm>({
    resolver: zodResolver(transfersFormSchema)
  });

  const { control, watch, setValue, handleSubmit, setError, clearErrors } = form;
  const watchForm = watch();

  const { data: gateway } = useGateway(watchForm.sourceChain);
  const { sendToken } = useGatewayContract(gateway?.address as `0x${string}`);

  const chainsFromToken = filterEvmChains(keyByFilterProtocols[watchForm.token]?.chains) || [];
  const sourceTokenAddress = chainsFromToken.find((c) => c.chain === watchForm.sourceChain)?.address;

  const {
    balanceOf,
    checkAllowance,
    approve: approveERC20,
    decimals
  } = useERC20(sourceTokenAddress as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: [
      "sourceChainBalance",
      keyByFilterProtocols[watchForm.token]?.asset?.symbol,
      watchForm.sourceChain,
      evmAddress ?? ""
    ],
    queryFn: async () => {
      if (!watchForm.sourceChain) return BigInt(0);
      let balance = BigInt(0);
      if (isEvmChain(watchForm.sourceChain)) {
        balance = await balanceOf(evmAddress as `0x${string}`);
      }
      return balance;
    },
    enabled: !!watchForm.sourceChain && isEvmChain(watchForm.sourceChain) && !!evmAddress
  });

  const showSuccessTx = useCallback(
    (txid: string, chain: string) => {
      let link = "";
      if (isBtcChain(chain)) {
        link = `${networkConfig?.mempoolApiUrl}/tx/${txid}`;
      } else if (isEvmChain(chain)) {
        const chainId = getChainID(chain);
        if (!isSupportedChain(Number(chainId))) return;
        const wagmiChain = getWagmiChain(Number(chainId));
        if (!wagmiChain) return;
        link = `${wagmiChain.blockExplorers?.default.url}/tx/${txid}`;
      }
      toast({
        title: "Transfer transaction successful",
        description: (
          <div className='mt-2 w-160 rounded-md'>
            <p className='text-white'>
              Txid:{" "}
              <a className='text-blue-500 underline' href={link} target='_blank' rel='noopener noreferrer'>
                {txid.slice(0, 8)}...{txid.slice(-8)} (click to view)
              </a>
            </p>
          </div>
        )
      });
    },
    [networkConfig?.mempoolApiUrl]
  );

  useEffect(() => {
    if (!watchForm.sourceChain) return;
    if (!isEvmChain(watchForm.sourceChain)) return;
    if (!isSupportedChain(chainId)) return;

    const sourceChainID = Number(getChainID(watchForm.sourceChain));
    if (sourceChainID && chainId !== Number(sourceChainID)) {
      switchChain({ chainId: Number(sourceChainID) });
    }
  }, [watchForm.sourceChain, switchChain, chainId]);

  useEffect(() => {
    if (decimals && watchForm.transferAmount && sourceChainBalance) {
      if (parseUnits(String(watchForm.transferAmount), Number(decimals)) > sourceChainBalance) {
        setError("transferAmount", {
          type: "manual",
          message: "Amount exceeds available balance"
        });
      } else {
        clearErrors("transferAmount");
      }
    }
  }, [decimals, watchForm.transferAmount, sourceChainBalance, setError, clearErrors]);

  const onSubmit = async (values: TTransfersForm) => {
    setIsLoading(true);

    try {
      validateTransferConfig(sourceTokenAddress, gateway);

      if (!isEvmChain(values.destinationChain) || !isEvmChain(values.sourceChain)) {
        throw new Error("Invalid chain types");
      }

      if (!evmAddress) {
        throw new Error("Please connect your wallet first");
      }

      const balance = sourceChainBalance || 0n;
      const protocol = keyByFilterProtocols[values.token];
      const newTransferAmount = parseUnits(String(values.transferAmount), Number(decimals));

      if (balance < BigInt(newTransferAmount)) {
        throw new Error(
          `Insufficient balance, your balance is ${balance} ${protocol?.asset?.symbol}. Please try a smaller amount.`
        );
      }

      await handleTokenApproval({
        owner: evmAddress,
        gatewayAddress: gateway?.address as Hex,
        transferAmount: BigInt(newTransferAmount),
        checkAllowance,
        approveERC20
      });

      try {
        const transferTx = await sendToken({
          destinationChain: values.destinationChain,
          destinationAddress: values.destRecipientAddress,
          symbol: protocol?.asset?.symbol || "",
          amount: BigInt(newTransferAmount)
        });

        if (!transferTx) throw new Error("Failed to create transfer transaction");

        const transferConfirmed = await Promise.race([
          new Promise((_, reject) => setTimeout(() => reject(new Error("Transfer timeout")), 60000)),
          transferTx.wait()
        ]);

        if (transferConfirmed) {
          showSuccessTx(transferTx.hash, values.sourceChain);
        } else {
          throw new Error("Transfer failed");
        }
      } catch (error: any) {
        if (error.message?.includes("contract runner")) {
          throw new Error("Please ensure your wallet is connected and network is correct");
        }
        throw error;
      }
    } catch (error: any) {
      let errorMessage = "";

      if (error.data) {
        try {
          const decodedError = decodeErrorResult({
            abi: IGateway_ABI,
            data: error.data as `0x${string}`
          });

          errorMessage = `Contract error: ${decodedError.errorName}`;
          if (decodedError.args) {
            errorMessage += ` (${decodedError.args.join(", ")})`;
          }
        } catch (_decodeError) {}
      }

      if (!errorMessage) {
        errorMessage = error.message;
      }

      sonnerToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-2xl border-none shadow-none'>
      {/* <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="font-bold text-xl">Transfers</CardTitle>
      </CardHeader> */}
      <CardContent className='px-0'>
        <Form {...form}>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {/* Select Token */}
            <div className='space-y-1 rounded-lg bg-background-secondary p-4'>
              <FormField
                control={control}
                name='token'
                render={({ field: { onChange, value } }) => (
                  <FormItem className='mb-3'>
                    <SelectSearch
                      value={value}
                      onChange={(newValue) => {
                        setValue("sourceChain", "");
                        setValue("destinationChain", "");
                        onChange(newValue);
                      }}
                      placeholder='Select Token'
                      searchByHideValue
                      options={filterProtocols.map(({ asset, scalar_address, avatar }) => ({
                        value: scalar_address || "",
                        label: (
                          <div className='flex items-center gap-2'>
                            <Base64Icon url={avatar} className='size-6' />
                            <span className='font-semibold text-base'>{asset?.symbol}</span>
                          </div>
                        ),
                        hideValue: asset?.symbol
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='transferAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Please enter the amount'
                        className='!text-base rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className='text-right text-base text-text-primary-500/50'>
                <span>Available wallet:</span>{" "}
                <span>
                  {!isNil(sourceChainBalance) ? formatUnits(sourceChainBalance, Number(decimals)) : 0}{" "}
                  {keyByFilterProtocols[watchForm.token]?.asset?.symbol}
                </span>
              </p>
            </div>

            {/* From - To */}
            <div className='flex gap-4'>
              <FormField
                control={control}
                name='sourceChain'
                render={({ field: { onChange, value } }) => (
                  <FormItem className='flex flex-1 flex-col gap-2 rounded-lg bg-background-secondary p-4'>
                    <FormLabel className='text-base'>From</FormLabel>
                    <SelectSearch
                      disabled={!watchForm.token}
                      value={value}
                      onChange={onChange}
                      placeholder='Select chain'
                      searchByHideValue
                      options={chainsFromToken.map(({ chain, name }) => ({
                        value: chain || "",
                        label: (
                          <ChainIcon
                            chain={chain as SupportedChains}
                            showName
                            customName={name}
                            classNames={{ icon: "size-5", name: "text-base" }}
                          />
                        ),
                        disabled: chain === watchForm.destinationChain,
                        hideValue: name || Chains[chain as SupportedChains]?.name
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='button'
                size='icon'
                className='mt-auto mb-4'
                onClick={() => {
                  setValue("sourceChain", watchForm.destinationChain);
                  setValue("destinationChain", watchForm.sourceChain);
                }}
                disabled={!(watchForm.sourceChain || watchForm.destinationChain)}
              >
                <ArrowRightLeft size={18} />
              </Button>
              <FormField
                control={control}
                name='destinationChain'
                render={({ field: { onChange, value } }) => (
                  <FormItem className='flex flex-1 flex-col gap-2 rounded-lg bg-background-secondary p-4'>
                    <FormLabel className='text-base'>To</FormLabel>
                    <SelectSearch
                      disabled={!watchForm.token}
                      onChange={onChange}
                      value={value}
                      placeholder='Select chain'
                      searchByHideValue
                      options={chainsFromToken.map(({ chain, name }) => ({
                        value: chain || "",
                        label: (
                          <ChainIcon
                            chain={chain as SupportedChains}
                            showName
                            customName={name}
                            classNames={{ icon: "size-5", name: "text-base" }}
                          />
                        ),
                        disabled: chain === watchForm.sourceChain,
                        hideValue: name || Chains[chain as SupportedChains]?.name
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination Address */}
            <FormField
              control={control}
              name='destRecipientAddress'
              render={({ field }) => (
                <FormItem className='space-y-4 rounded-lg bg-background-secondary p-4'>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Destination address'
                      className='!text-base rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Information */}
            {/* <div className="space-y-2 rounded-lg bg-background-secondary p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge Fee</span>
                <span>0.00001 BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estimated wait time
                </span>
                <span>~1 minute</span>
              </div>
            </div> */}

            <If condition={isConnected} fallback={<ConnectEvm hideTitle />}>
              <Button
                type='submit'
                size='lg'
                className='w-full'
                disabled={!sourceChainBalance}
                isLoading={isLoading}
              >
                Transfer
              </Button>
            </If>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
