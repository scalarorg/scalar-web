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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useFeeRates, useScalarProtocols, useVault } from "@/hooks";
import {
  formatBTC,
  getChainID,
  isBtcChain,
  isEvmChain,
  parseSats,
  prepareCustodianPubkeysArray,
  validateRequiredFields,
} from "@/lib/utils";
import { getWagmiChain, isSupportedChain } from "@/lib/wagmi";
import { useWalletInfo, useWalletProvider } from "@/providers/wallet-provider";
import { TProtocol } from "@/types/protocol";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChainType,
  DestinationChain,
  TBuildCustodianOnlyStakingPsbt,
  hexToBytes,
} from "@scalar-lab/bitcoin-vault";
import * as bitcoin from "bitcoinjs-lib";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Hex, hexToBytes as hexToBytesViem } from "viem";
import { TBridgeForm, bridgeFormSchema } from "../schemas";

export const BridgeForm = () => {
  const walletInfo = useWalletInfo();
  const [protocol, setProtocol] = useState<TProtocol | undefined>();
  const vault = useVault(protocol?.tag);
  const { networkConfig, walletProvider, mempoolClient } = useWalletProvider();

  const feeRates = useFeeRates(walletInfo.address, mempoolClient);

  const form = useForm<TBridgeForm>({
    resolver: zodResolver(bridgeFormSchema),
  });
  const { watch, setError, clearErrors } = form;

  const destinationChainForm = watch("destinationChain");
  const transferAmountForm = watch("transferAmount");

  const { data } = useScalarProtocols();

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

  const onSubmit = async (values: TBridgeForm) => {
    const [_, chainSeleted] = values.destinationChain?.split("-") || [];
    const parseTransferAmount = parseSats(String(values.transferAmount));

    try {
      if (!isBtcChain(protocol?.asset?.chain) || !isEvmChain(chainSeleted)) {
        throw new Error("Invalid chain types");
      }

      const btcNetwork = networkConfig?.network;
      const btcPubkey = walletInfo.pubkey;
      const btcAddress = walletInfo.address;
      const currentChains = protocol?.chains || [];

      const [destination] = currentChains.filter(
        (c) => c.chain === chainSeleted,
      );

      validateRequiredFields({
        vault,
        btcNetwork,
        protocol,
        walletProvider,
        destChain: chainSeleted,
        custodians: protocol?.custodian_group?.custodians,
        quorum: protocol?.custodian_group?.quorum,
        btcPubkey,
        btcAddress,
      });

      if (protocol?.custodian_group?.quorum! < 1) {
        throw new Error("Quorum must be greater than 0");
      }

      const addressUtxos = await walletProvider?.getUtxos(
        btcAddress,
        Number(parseTransferAmount),
      );

      if (!addressUtxos) throw new Error("Not enough UTXOs");

      const txData = {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        utxos: addressUtxos.map((utxo) => ({ ...utxo, status: {} as any })),
        // TODO: apply dynamic feerates

        // feeRate:
        //   data.btcFeeRate === "customFee"
        //     ? (data.customFeeRate ?? feeRates.fastestFee)
        //     : feeRates.minimumFee,

        feeRate: feeRates.minimumFee,
        addresses: {
          btcUserPk: hexToBytes(btcPubkey),
          destinationRecipient: hexToBytesViem(
            values.destRecipientAddress as Hex,
          ),
          destinationToken: hexToBytesViem(destination.address as Hex),
        },
      };

      const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
        protocol?.custodian_group?.custodians || [],
      );

      const chainID = getChainID(chainSeleted);
      if (!chainID) throw new Error("Invalid destination chain");

      const destinationChain = new DestinationChain(
        ChainType.EVM,
        BigInt(chainID),
      );

      const psbtFormData: TBuildCustodianOnlyStakingPsbt = {
        stakingAmount: BigInt(parseTransferAmount),
        stakerPubkey: txData.addresses.btcUserPk,
        stakerAddress: btcAddress,
        custodianPubkeys: custodianPubkeysBufferArray,
        custodianQuorum: protocol?.custodian_group?.quorum || 0,
        destinationChain,
        destinationContractAddress: txData.addresses.destinationToken,
        destinationRecipientAddress: txData.addresses.destinationRecipient,
        availableUTXOs: txData.utxos,
        feeRate: txData.feeRate,
        rbf: true,
      };

      const { psbt: unsignedVaultPsbt } =
        vault!.buildCustodianOnlyStakingPsbt(psbtFormData);

      const signedPsbt = await walletProvider?.signPsbt(
        unsignedVaultPsbt.toHex(),
        {
          autoFinalized: true,
        },
      );

      if (!signedPsbt) throw new Error("Failed to sign the PSBT");

      const txHex = bitcoin.Psbt.fromHex(signedPsbt)
        .extractTransaction()
        .toHex();
      const txId = await walletProvider?.pushTx(txHex);

      showSuccessTx(txId!, protocol?.asset?.chain as string);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const [_, chainSeleted] = destinationChainForm?.split("-") || [];
    const [newProtocol] =
      data?.protocols?.filter(
        (p) =>
          (p.chains?.filter((c) => c.chain === chainSeleted) || []).length > 0,
      ) || [];
    setProtocol(newProtocol);
  }, [destinationChainForm, data]);

  useEffect(() => {
    if (
      transferAmountForm &&
      parseSats(String(transferAmountForm)) > Number(walletInfo.balance)
    ) {
      setError("transferAmount", {
        type: "manual",
        message: "Amount exceeds available balance",
      });
    } else {
      clearErrors("transferAmount");
    }
  }, [transferAmountForm, walletInfo.balance, setError, clearErrors]);

  return (
    <Card className="mx-auto w-full max-w-2xl border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-bold text-2xl">Bridge</CardTitle>
        <div className="text-right">
          <span className="text-muted-foreground text-sm">BTC Balance: </span>
          <span>{formatBTC(walletInfo.balance)} BTC</span>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* From Section */}
            <FormField
              control={form.control}
              name="transferAmount"
              render={({ field }) => (
                <FormItem className="space-y-4 rounded-lg bg-[#F6F8FF] p-4">
                  <FormLabel>From</FormLabel>
                  <div className="flex items-center gap-2 rounded-lg">
                    <div className="flex flex-1 flex-col gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Please enter the amount"
                          className="rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
                        />
                      </FormControl>
                    </div>
                    <div className="font-medium">BTC</div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="destinationChain"
                render={({ field }) => (
                  <FormItem className="space-y-4 rounded-lg bg-[#F6F8FF] p-4">
                    <div className="flex items-center gap-2 rounded-lg">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <FormLabel>To</FormLabel>
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
                              {data?.protocols?.map(
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
                        {watch("transferAmount") || 0}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination Address */}
            <FormField
              control={form.control}
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

            <Button
              type="submit"
              className="h-12 w-full text-lg"
              disabled={!walletInfo.balance}
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
