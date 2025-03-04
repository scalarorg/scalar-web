import { IGateway_ABI } from "@/abis/igateway";
import { ConnectEvm } from "@/components/connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  useERC20,
  useGateway,
  useGatewayContract,
  useScalarProtocols,
} from "@/hooks";
import {
  getChainID,
  handleTokenApproval,
  isBtcChain,
  isEvmChain,
  validateTransferConfig,
} from "@/lib/utils";
import { getWagmiChain, isSupportedChain } from "@/lib/wagmi";
import { useWalletProvider } from "@/providers/wallet-provider";
import { TProtocolDetails } from "@/types/protocol";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { isNil, keyBy } from "lodash";
import { ArrowRightLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import { decodeErrorResult, formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TTransfersForm, transfersFormSchema } from "../schemas";

const MIN_EVM = 2;

const filterEvmChains = (chains: TProtocolDetails["chains"] = []) =>
  chains.filter((c) => isEvmChain(c));

export const TransfersForm = () => {
  const [_isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const { address: evmAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    data: { protocols = [] } = {},
  } = useScalarProtocols();
  const { networkConfig } = useWalletProvider();
  const filterProtocols = protocols.filter(
    (p) => filterEvmChains(p.chains).length >= MIN_EVM,
  );
  const keyByFilterProtocols = keyBy(filterProtocols, "scalar_address");

  const form = useForm<TTransfersForm>({
    resolver: zodResolver(transfersFormSchema),
  });

  const { control, watch, setValue, handleSubmit, setError, clearErrors } =
    form;
  const watchForm = watch();

  const { data: gateway } = useGateway(watchForm.sourceChain);
  const { sendToken } = useGatewayContract(gateway?.address as `0x${string}`);

  const chainsFromToken =
    filterEvmChains(keyByFilterProtocols[watchForm.token]?.chains) || [];
  const sourceChainAddress = chainsFromToken.find(
    (c) => c.chain === watchForm.sourceChain,
  )?.address;

  const {
    balanceOf,
    checkAllowance,
    approve: approveERC20,
    decimals,
  } = useERC20(sourceChainAddress as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: [
      "sourceChainBalance",
      keyByFilterProtocols[watchForm.token]?.asset?.symbol,
      watchForm.sourceChain,
      evmAddress ?? "",
    ],
    queryFn: async () => {
      if (!watchForm.sourceChain) return BigInt(0);
      let balance = BigInt(0);
      if (isEvmChain(watchForm.sourceChain)) {
        balance = await balanceOf(evmAddress as `0x${string}`);
      }
      return balance;
    },
    enabled:
      !!watchForm.sourceChain &&
      isEvmChain(watchForm.sourceChain) &&
      !!evmAddress,
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
          <div className="mt-2 w-[640px] rounded-md">
            <p className="text-white">
              Txid:{" "}
              <a
                className="text-blue-500 underline"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {txid.slice(0, 8)}...{txid.slice(-8)} (click to view)
              </a>
            </p>
          </div>
        ),
      });
    },
    [networkConfig?.mempoolApiUrl],
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
      if (
        parseUnits(String(watchForm.transferAmount), Number(decimals)) >
        sourceChainBalance
      ) {
        setError("transferAmount", {
          type: "manual",
          message: "Amount exceeds available balance",
        });
      } else {
        clearErrors("transferAmount");
      }
    }
  }, [
    decimals,
    watchForm.transferAmount,
    sourceChainBalance,
    setError,
    clearErrors,
  ]);

  const onSubmit = async (values: TTransfersForm) => {
    setIsLoading(true);

    try {
      validateTransferConfig(sourceChainAddress, gateway);

      if (
        !isEvmChain(values.destinationChain) ||
        !isEvmChain(values.sourceChain)
      ) {
        throw new Error("Invalid chain types");
      }

      if (!evmAddress) {
        throw new Error("Please connect your wallet first");
      }

      const balance = sourceChainBalance || 0n;
      const protocol = keyByFilterProtocols[values.token];
      const newTransferAmount = parseUnits(
        String(values.transferAmount),
        Number(decimals),
      );

      if (balance < BigInt(newTransferAmount)) {
        throw new Error(
          `Insufficient balance, your balance is ${balance} ${protocol?.asset?.symbol}. Please try a smaller amount.`,
        );
      }

      await handleTokenApproval(
        sourceChainAddress || "",
        gateway?.address as `0x${string}`,
        BigInt(newTransferAmount),
        { checkAllowance, approveERC20 },
      );

      try {
        const transferTx = await sendToken({
          destinationChain: values.destinationChain,
          destinationAddress: values.destRecipientAddress,
          symbol: protocol?.asset?.symbol || "",
          amount: BigInt(newTransferAmount),
        });

        if (!transferTx)
          throw new Error("Failed to create transfer transaction");

        const transferConfirmed = await Promise.race([
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Transfer timeout")), 60000),
          ),
          transferTx.wait(),
        ]);

        if (transferConfirmed) {
          showSuccessTx(transferTx.hash, values.sourceChain);
        } else {
          throw new Error("Transfer failed");
        }
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        if (error.message?.includes("contract runner")) {
          throw new Error(
            "Please ensure your wallet is connected and network is correct",
          );
        }
        throw error;
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      let errorMessage = "";

      if (error.data) {
        try {
          const decodedError = decodeErrorResult({
            abi: IGateway_ABI,
            data: error.data as `0x${string}`,
          });

          errorMessage = `Contract error: ${decodedError.errorName}`;
          if (decodedError.args) {
            errorMessage += ` (${decodedError.args.join(", ")})`;
          }
        } catch (decodeError) {
          console.error("Failed to decode error:", decodeError);
        }
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
    <Card className="mx-auto w-full max-w-2xl border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="font-bold text-2xl">Transfers</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Select Token */}
            <div className="space-y-1 rounded-lg bg-[#F6F8FF] p-4">
              <FormField
                control={control}
                name="token"
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        setValue("sourceChain", "");
                        setValue("destinationChain", "");
                        onChange(value);
                      }}
                      defaultValue={value}
                    >
                      <FormControl>
                        <SelectTrigger className="!text-lg w-fit min-w-[160px]">
                          <SelectValue placeholder="Select Token" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filterProtocols.map(({ asset, scalar_address }) => (
                          <SelectItem
                            key={scalar_address}
                            value={scalar_address || ""}
                            className="text-lg"
                          >
                            {asset?.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="transferAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Please enter the amount"
                        className="!text-lg rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-right text-lg">
                <span className="text-border">Available wallet:</span>{" "}
                <span>
                  {!isNil(sourceChainBalance)
                    ? formatUnits(sourceChainBalance, Number(decimals))
                    : 0}{" "}
                  {keyByFilterProtocols[watchForm.token]?.asset?.symbol}
                </span>
              </p>
            </div>

            {/* From - To */}
            <div className="flex gap-4">
              <FormField
                control={control}
                name="sourceChain"
                render={({ field: { onChange, value } }) => (
                  <FormItem className="flex flex-1 flex-col gap-2 rounded-lg bg-[#F6F8FF] p-4">
                    <FormLabel className="text-lg">From</FormLabel>
                    <Select
                      disabled={!watchForm.token}
                      onValueChange={onChange}
                      value={value}
                    >
                      <FormControl>
                        <SelectTrigger className="!text-lg">
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chainsFromToken.map(({ chain, name }) => (
                          <SelectItem
                            disabled={chain === watchForm.destinationChain}
                            key={chain}
                            value={chain || ""}
                            className="text-lg"
                          >
                            {name || chain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                size="icon"
                className="mt-auto mb-4"
                onClick={() => {
                  setValue("sourceChain", watchForm.destinationChain);
                  setValue("destinationChain", watchForm.sourceChain);
                }}
                disabled={
                  !(watchForm.sourceChain || watchForm.destinationChain)
                }
              >
                <ArrowRightLeft size={18} />
              </Button>
              <FormField
                control={control}
                name="destinationChain"
                render={({ field: { onChange, value } }) => (
                  <FormItem className="flex flex-1 flex-col gap-2 rounded-lg bg-[#F6F8FF] p-4">
                    <FormLabel className="text-lg">To</FormLabel>
                    <Select
                      disabled={!watchForm.token}
                      onValueChange={onChange}
                      value={value}
                    >
                      <FormControl>
                        <SelectTrigger className="!text-lg">
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chainsFromToken.map(({ chain, name }) => (
                          <SelectItem
                            disabled={chain === watchForm.sourceChain}
                            key={chain}
                            value={chain || ""}
                            className="text-lg"
                          >
                            {name || chain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination Address */}
            <FormField
              control={control}
              name="destRecipientAddress"
              render={({ field }) => (
                <FormItem className="space-y-4 rounded-lg bg-[#F6F8FF] p-4">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Destination address"
                      className="!text-lg rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Information */}
            {/* <div className="space-y-2 rounded-lg bg-[#F6F8FF] p-4">
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

            {isConnected ? (
              <Button
                type="submit"
                className="h-12 w-full text-lg"
                disabled={!sourceChainBalance}
              >
                Transfer
              </Button>
            ) : (
              <ConnectEvm hideTitle className="h-12 text-lg" />
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
