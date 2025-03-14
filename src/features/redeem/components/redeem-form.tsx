import {
  Base64Icon,
  ChainIcon,
  SelectSearch,
  TSelectSearchGroup,
} from "@/components/common";
import { ConnectBtc, ConnectEvm } from "@/components/connect";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import {
  useERC20,
  useFeeRates,
  useGateway,
  useGatewayContract,
  useScalarProtocols,
  useVault,
} from "@/hooks";
import {
  decodeScalarBytesToString,
  decodeScalarBytesToUint8Array,
} from "@/lib/scalar";
import {
  EMPTY_ADDRESS,
  VOUT_INDEX_OF_LOCKING_OUTPUT,
  formatBTC,
  getChainID,
  handleTokenApproval,
  isBtcChain,
  isEvmChain,
  parseSats,
  prepareCustodianPubkeysArray,
  validateTransferConfig,
} from "@/lib/utils";
import { getWagmiChain, isSupportedChain } from "@/lib/wagmi";
import { useWalletInfo, useWalletProvider } from "@/providers/wallet-provider";
import { SupportedChains } from "@/types/chains";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BTCFeeOpts,
  TBuildUPCUnstakingPsbt,
  bytesToHex,
  calculateContractCallWithTokenPayload,
  hexToBytes,
} from "@scalar-lab/bitcoin-vault";
import { useQuery } from "@tanstack/react-query";
import * as bitcoin from "bitcoinjs-lib";
import { isNil } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TRedeemForm, redeemFormSchema } from "../schemas";

const getChainSelected = (value = "") => {
  const [_, chain] = value.split("-") || [];

  return chain;
};

export const RedeemForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const { address: evmAddress, isConnected: isConnectedEvm } = useAccount();
  const chainId = useChainId();

  const form = useForm<TRedeemForm>({
    resolver: zodResolver(redeemFormSchema),
  });
  const { control, watch, setError, clearErrors, handleSubmit } = form;
  const watchForm = watch();

  const {
    pubkey: btcPubkey,
    address: btcAddress,
    isConnected: isConnectedBtc,
  } = useWalletInfo();
  const {
    data: { protocols = [] } = {},
  } = useScalarProtocols();
  const { networkConfig, btcNetwork, mempoolClient, walletProvider } =
    useWalletProvider();

  const feeRates = useFeeRates(btcAddress, mempoolClient);
  const filterProtocols = protocols.filter((p) => isBtcChain(p?.asset?.chain));

  const selectOptions: TSelectSearchGroup[] = useMemo(() => {
    return filterProtocols.map(({ scalar_address, asset, chains, avatar }) => ({
      groupLabel: (
        <div className="flex items-center gap-2">
          <Base64Icon url={avatar} className="size-6" />
          <span className="font-semibold text-base">{asset?.symbol}</span>
        </div>
      ),
      key: scalar_address || "",
      items:
        chains
          ?.filter((c) => c.chain !== asset?.chain)
          .map(({ name, chain }) => ({
            value: `${asset?.symbol}-${chain}`,
            label: (
              <ChainIcon
                chain={chain as SupportedChains}
                showName
                customName={name}
                classNames={{ icon: "size-5", name: "text-base" }}
              />
            ),
          })) || [],
    }));
  }, [filterProtocols]);

  const selectedProtocol = filterProtocols.find((p) =>
    p?.chains?.find(
      (c) => `${p?.asset?.symbol}-${c?.chain}` === watchForm.sourceChain,
    ),
  );

  const vault = useVault(
    selectedProtocol?.tag
      ? decodeScalarBytesToString(selectedProtocol.tag)
      : undefined,
  );

  const sourceChainSelected = getChainSelected(watchForm.sourceChain);

  const upcLockingScript = useMemo(() => {
    if (
      !vault ||
      !btcNetwork ||
      !btcPubkey ||
      !selectedProtocol?.custodian_group?.custodians ||
      !selectedProtocol.custodian_group.quorum ||
      !selectedProtocol.bitcoin_pubkey
    ) {
      return null;
    }

    const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
      selectedProtocol.custodian_group.custodians,
    );

    const userPubkey = hexToBytes(btcPubkey.replace("0x", ""));

    const protocolPubkey = decodeScalarBytesToUint8Array(
      selectedProtocol.bitcoin_pubkey,
    );

    const script = vault.upcLockingScript({
      userPubkey,
      protocolPubkey,
      custodianPubkeys: custodianPubkeysBufferArray,
      custodianQuorum: selectedProtocol.custodian_group.quorum,
    });

    return Buffer.from(script);
  }, [vault, btcNetwork, selectedProtocol, btcPubkey]);

  const upcLockingAddress = useMemo(() => {
    if (!upcLockingScript) return null;
    return bitcoin.address.fromOutputScript(upcLockingScript, btcNetwork);
  }, [upcLockingScript, btcNetwork]);

  const { data: availableUnstakedUtxos } = useQuery({
    queryKey: [
      "availableUnstakedUtxos",
      upcLockingAddress,
      sourceChainSelected,
    ],
    queryFn: async () => {
      const satsAmount = parseSats(
        watchForm.transferAmount ? String(watchForm.transferAmount) : "",
      );

      if (!isBtcChain(selectedProtocol?.asset?.chain)) return [];

      const addressUtxos = await mempoolClient!.addresses.getAddressTxsUtxo({
        address: upcLockingAddress!,
      });

      let total = 0;
      const utxos = [];
      for (const utxo of addressUtxos) {
        if (!utxo.status.confirmed) {
          continue;
        }
        if (total > satsAmount) {
          break;
        }

        utxos.push(utxo);
        total += utxo.value;
      }

      return utxos.sort(
        (a, b) => b.value - a.value || b.txid.localeCompare(a.txid),
      );
    },
    enabled: !!(upcLockingAddress && mempoolClient),
  });

  const { data: gateway } = useGateway(sourceChainSelected);
  const { callContractWithToken } = useGatewayContract(
    gateway?.address as `0x${string}`,
  );

  const tokenAddress = selectedProtocol?.chains?.find(
    (c) => c.chain === sourceChainSelected,
  )?.address;

  const {
    balanceOf,
    checkAllowance,
    approve: approveERC20,
    decimals,
  } = useERC20(tokenAddress as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: ["sourceChainBalance", sourceChainSelected, evmAddress ?? ""],
    queryFn: async () => {
      if (!sourceChainSelected) return BigInt(0);
      let balance = BigInt(0);
      if (isEvmChain(sourceChainSelected)) {
        balance = await balanceOf(evmAddress as `0x${string}`);
      }
      return balance;
    },
    enabled:
      !!sourceChainSelected && isEvmChain(sourceChainSelected) && !!evmAddress,
  });

  useEffect(() => {
    if (!sourceChainSelected) return;
    if (!isEvmChain(sourceChainSelected)) return;
    if (!isSupportedChain(chainId)) return;

    const sourceChainID = Number(getChainID(sourceChainSelected));
    if (sourceChainID && chainId !== Number(sourceChainID)) {
      switchChain({ chainId: Number(sourceChainID) });
    }
  }, [sourceChainSelected, switchChain, chainId]);

  useEffect(() => {
    if (watchForm.transferAmount && sourceChainBalance && decimals) {
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

  const onSubmit = async (values: TRedeemForm) => {
    setIsLoading(true);
    try {
      validateTransferConfig(tokenAddress, gateway);

      const sourceChain = getChainSelected(values.sourceChain);

      if (
        !isEvmChain(sourceChain) ||
        !isBtcChain(selectedProtocol?.asset?.chain)
      ) {
        throw new Error("Invalid chain types");
      }

      const newTransferAmount = parseUnits(
        String(values.transferAmount),
        Number(decimals),
      );

      if ((sourceChainBalance || 0n) < BigInt(newTransferAmount)) {
        throw new Error("Insufficient balance");
      }

      if (!evmAddress) {
        throw new Error("Invalid EVM address");
      }

      await handleTokenApproval(
        evmAddress!,
        gateway?.address as `0x${string}`,
        BigInt(newTransferAmount),
        { checkAllowance, approveERC20 },
      );

      const redeemLockingScript = bitcoin.address.toOutputScript(
        values.destRecipientAddress,
        btcNetwork,
      );

      let payload = "";

      if (selectedProtocol?.attributes?.model === "LIQUIDITY_MODEL_POOL") {
        const reciepientChainIdentifier =
          Buffer.from(redeemLockingScript).toString("hex");
        payload = calculateContractCallWithTokenPayload({
          type: "custodianOnly",
          custodianOnly: {
            feeOpts: BTCFeeOpts.MinimumFee,
            rbf: true,
            recipientChainIdentifier: `0x${reciepientChainIdentifier}`,
          },
        });
      } else {
        if (!availableUnstakedUtxos || !availableUnstakedUtxos.length) {
          throw new Error("Not enough balances");
        }

        if (!upcLockingScript) {
          throw new Error("Invalid locking script");
        }

        const protocolPubkey = decodeScalarBytesToUint8Array(
          selectedProtocol!.bitcoin_pubkey!,
        );
        const custodianPubkeys = prepareCustodianPubkeysArray(
          selectedProtocol!.custodian_group!.custodians!,
        );
        const custodianQuorum = selectedProtocol!.custodian_group!.quorum!;
        const stakerPubkey = hexToBytes(btcPubkey.replace("0x", ""));

        const params: TBuildUPCUnstakingPsbt = {
          inputs: availableUnstakedUtxos?.map((tx) => ({
            txid: tx.txid,
            vout: VOUT_INDEX_OF_LOCKING_OUTPUT,
            value: BigInt(tx.value),
            script_pubkey: Uint8Array.from(upcLockingScript),
          })),
          output: {
            script: redeemLockingScript,
            value: newTransferAmount,
          },
          stakerPubkey,
          protocolPubkey,
          custodianPubkeys,
          custodianQuorum,
          feeRate: BigInt(feeRates.minimumFee),
          rbf: true,
          type: "user_custodian",
        };

        const unsignedPsbtHex = vault?.buildUPCUnstakingPsbt(params);

        const hexPsbt = bytesToHex(unsignedPsbtHex!);

        const signedPsbt = await walletProvider?.signPsbt(hexPsbt, {
          autoFinalized: false,
          toSignInputs: params.inputs.map((_input, index) => ({
            index,
            address: btcAddress,
            disableTweakSigner: true,
          })),
        });

        payload = calculateContractCallWithTokenPayload({
          type: "upc",
          upc: {
            psbt: `0x${signedPsbt}`,
          },
        });
      }

      const contractCallTx = await callContractWithToken({
        destinationChain: selectedProtocol?.asset?.chain!,
        destinationContractAddress: EMPTY_ADDRESS,
        payload,
        symbol: selectedProtocol?.asset?.symbol || "",
        amount: BigInt(newTransferAmount),
      });

      const contractCallConfirmed = await Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Transfer timeout")), 60000),
        ),
        contractCallTx.wait(),
      ]);

      if (contractCallConfirmed) {
        showSuccessTx(contractCallTx.hash, sourceChain);
      } else {
        throw new Error("Transfer failed");
      }
    } catch (error) {
      sonnerToast.error((error as Error).message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const availableBalance = useMemo(() => {
    const total =
      availableUnstakedUtxos?.reduce(
        (acc, tx) => acc + BigInt(tx.value),
        BigInt(0),
      ) || BigInt(0);
    return total;
  }, [availableUnstakedUtxos]);

  return (
    <Card className="mx-auto w-full max-w-2xl border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="font-bold text-xl">Redeem</CardTitle>
        <div className="text-right">
          <span>
            {formatBTC(availableBalance)}{" "}
            <span className="text-base text-muted-foreground">BTC</span>
          </span>
          {selectedProtocol?.asset?.symbol && (
            <>
              <span className="mx-2">|</span>
              <span className="text-muted-foreground text-sm">
                {selectedProtocol?.asset?.symbol}
              </span>
            </>
          )}
          {!isNil(sourceChainBalance) && (
            <span>: {formatUnits(sourceChainBalance, Number(decimals))}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* From Section */}
            <div className="space-y-1 rounded-lg bg-background-secondary p-4">
              <FormField
                control={control}
                name="sourceChain"
                render={({ field: { value, onChange } }) => (
                  <FormItem className="mb-3">
                    <div className="flex items-center gap-2 rounded-lg">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-base">From</FormLabel>
                          <SelectSearch
                            value={value}
                            onChange={onChange}
                            placeholder="Select Token"
                            options={selectOptions}
                            classNames={{
                              command: {
                                group: "py-1",
                                list: "max-h-50",
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Please enter the amount"
                        className="!text-base rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-right text-base">
                <span className="text-text-primary-500/50">
                  Available wallet:
                </span>{" "}
                <span className="mr-1 border-black border-r-2 pr-1">
                  {formatBTC(availableBalance)} BTC
                </span>
                <span>
                  {!isNil(sourceChainBalance)
                    ? formatUnits(sourceChainBalance, Number(decimals))
                    : 0}
                </span>
                {selectedProtocol?.asset?.symbol && (
                  <span> {selectedProtocol?.asset?.symbol}</span>
                )}
              </p>
            </div>

            {/* To Section */}
            <p className="flex items-center gap-2 rounded-lg bg-background-secondary p-4 text-base">
              To{" "}
              {selectedProtocol?.asset?.chain && (
                <ChainIcon
                  chain={selectedProtocol?.asset?.chain as SupportedChains}
                  showName
                  classNames={{ wrapper: "gap-1" }}
                />
              )}
            </p>

            {/* Destination Address */}
            <FormField
              control={control}
              name="destRecipientAddress"
              render={({ field }) => (
                <FormItem className="space-y-4 rounded-lg bg-background-secondary p-4">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Destination address"
                      className="!text-base rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isConnectedEvm ? (
              selectedProtocol?.attributes?.model === "LIQUIDITY_MODEL_UPC" &&
              !isConnectedBtc ? (
                <Popover>
                  <PopoverTrigger className="w-full" asChild>
                    <Button type="button" className="w-full" size="lg">
                      Connect wallet
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top">
                    <ConnectBtc hideTitle />
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!sourceChainBalance}
                  isLoading={isLoading}
                  size="lg"
                >
                  Redeem
                </Button>
              )
            ) : (
              <ConnectEvm hideTitle />
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
