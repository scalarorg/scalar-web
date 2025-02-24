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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ELiquidityModel } from "@/enums";
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
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TRedeemForm, redeemFormSchema } from "../schemas";

const getChainSelected = (value = "") => {
  const [_, chain] = value.split("-") || [];

  return chain;
};

export const RedeemForm = () => {
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

  const protocolSelected = filterProtocols.find((p) =>
    p?.chains?.find(
      (c) => `${p?.asset?.name}-${c?.chain}` === watchForm.sourceChain,
    ),
  );

  const vault = useVault(
    protocolSelected?.tag
      ? decodeScalarBytesToString(protocolSelected.tag)
      : undefined,
  );

  const originalChain = protocolSelected?.chains?.find(
    (c) => c?.chain === protocolSelected?.asset?.chain,
  );

  const sourceChainSelected = getChainSelected(watchForm.sourceChain);

  const upcLockingScript = useMemo(() => {
    if (
      !vault ||
      !btcNetwork ||
      !btcPubkey ||
      !protocolSelected?.custodian_group?.custodians ||
      !protocolSelected.custodian_group.quorum ||
      !protocolSelected.bitcoin_pubkey
    ) {
      return null;
    }

    const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
      protocolSelected.custodian_group.custodians,
    );

    const userPubkey = hexToBytes(btcPubkey.replace("0x", ""));

    const protocolPubkey = decodeScalarBytesToUint8Array(
      protocolSelected.bitcoin_pubkey,
    );

    const script = vault.upcLockingScript({
      userPubkey,
      protocolPubkey,
      custodianPubkeys: custodianPubkeysBufferArray,
      custodianQuorum: protocolSelected.custodian_group.quorum,
    });

    return Buffer.from(script);
  }, [vault, btcNetwork, protocolSelected, btcPubkey]);

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

      if (!isBtcChain(originalChain?.chain)) return [];

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

  const tokenAddress = protocolSelected?.chains?.find(
    (c) => c.chain === sourceChainSelected,
  )?.address;

  const {
    balanceOf,
    checkAllowance,
    approve: approveERC20,
    getDecimals,
  } = useERC20(tokenAddress as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: [
      "sourceChainBalance",
      protocolSelected?.asset?.name,
      sourceChainSelected,
      evmAddress ?? "",
    ],
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

  const [decimals, setDecimals] = useState<bigint | undefined>();

  useEffect(() => {
    const fetchDecimals = async () => {
      if (getDecimals) {
        const decimals = await getDecimals();
        setDecimals(decimals);
      }
    };

    fetchDecimals();
  }, [getDecimals]);

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
    try {
      validateTransferConfig(tokenAddress, gateway);

      const sourceChain = getChainSelected(values.sourceChain);

      if (!isEvmChain(sourceChain) || !isBtcChain(originalChain?.chain)) {
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

      if (protocolSelected?.attribute?.model === ELiquidityModel.POOLING) {
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
          protocolSelected!.bitcoin_pubkey!,
        );
        const custodianPubkeys = prepareCustodianPubkeysArray(
          protocolSelected!.custodian_group!.custodians!,
        );
        const custodianQuorum = protocolSelected!.custodian_group!.quorum!;
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
        destinationChain: originalChain?.chain!,
        destinationContractAddress: EMPTY_ADDRESS,
        payload,
        symbol: protocolSelected?.asset?.name || "",
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
      console.error(error);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-bold text-2xl">Redeem</CardTitle>
        <div className="text-right">
          <span className="text-muted-foreground text-sm">
            {protocolSelected?.asset?.name}
          </span>
          {!isNil(sourceChainBalance) && (
            <span>: {formatUnits(sourceChainBalance, Number(decimals))}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* From Section */}
            <div className="space-y-4 rounded-lg bg-[#F6F8FF] p-4">
              <FormField
                control={control}
                name="sourceChain"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 rounded-lg">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <FormLabel>From</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Select Token" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filterProtocols?.map(
                                ({ scalar_address, asset, chains }) => (
                                  <SelectGroup key={scalar_address}>
                                    <SelectLabel>{asset?.name}</SelectLabel>
                                    {chains
                                      ?.filter((c) => c.chain !== asset?.chain)
                                      .map(({ name, chain }) => (
                                        <SelectItem
                                          key={`${asset?.name}-${chain}`}
                                          value={`${asset?.name}-${chain}`}
                                          className="capitalize"
                                        >
                                          {name || chain}
                                        </SelectItem>
                                      ))}
                                  </SelectGroup>
                                ),
                              )}
                            </SelectContent>
                          </Select>
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
                        className="rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* To Section */}
            <p className="space-y-4 rounded-lg bg-[#F6F8FF] p-4">
              To {originalChain?.name || originalChain?.chain}
            </p>

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
                      className="rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isConnectedEvm ? (
              protocolSelected?.attribute?.model ===
                ELiquidityModel.TRANSACTIONAL && !isConnectedBtc ? (
                <Popover>
                  <PopoverTrigger className="w-full">
                    <Button type="button" className="h-12 w-full text-lg">
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
                  className="h-12 w-full text-lg"
                  disabled={!sourceChainBalance}
                >
                  Redeem
                </Button>
              )
            ) : (
              <ConnectEvm hideTitle className="h-12 text-lg" />
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
