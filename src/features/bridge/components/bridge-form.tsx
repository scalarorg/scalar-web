import { Base64Icon, ChainIcon, SelectSearch, TSelectSearchGroup } from "@/components/common";
import { ConnectBtc } from "@/components/connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { useFeeRates, useScalarProtocols, useVault } from "@/hooks";
import { Chains } from "@/lib/chains";
import {
  BTC_DECIMALS,
  formatBTC,
  getChainID,
  isBtcChain,
  isEvmChain,
  parseSats,
  prepareCustodianPubkeysArray,
  validateRequiredFields
} from "@/lib/utils";
import { getWagmiChain, isSupportedChain } from "@/lib/wagmi";
import { useWalletInfo, useWalletProvider } from "@/providers/wallet-provider";
import { SupportedChains } from "@/types/chains";
import { TProtocolDetails } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChainType,
  DestinationChain,
  TBuildCustodianOnlyStakingPsbt,
  hexToBytes
} from "@scalar-lab/bitcoin-vault";
import * as bitcoin from "bitcoinjs-lib";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import { Hex, hexToBytes as hexToBytesViem } from "viem";
import { TBridgeForm, bridgeFormSchema } from "../schemas";

const btcChain = Chains["bitcoin|4"];

export const BridgeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const walletInfo = useWalletInfo();
  const [protocol, setProtocol] = useState<TProtocolDetails | undefined>();
  const vault = useVault(protocol?.tag);
  const { networkConfig, walletProvider, mempoolClient } = useWalletProvider();

  const feeRates = useFeeRates(walletInfo.address, mempoolClient);

  const form = useForm<TBridgeForm>({
    resolver: zodResolver(bridgeFormSchema)
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
          <div className='mt-2 w-[640px] rounded-md'>
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

  const onSubmit = async (values: TBridgeForm) => {
    const [_, chainSeleted] = values.destinationChain?.split("-") || [];

    const parseTransferAmount = parseSats(values.transferAmount.toFixed(BTC_DECIMALS));

    setIsLoading(true);

    try {
      if (!isBtcChain(protocol?.asset?.chain) || !isEvmChain(chainSeleted)) {
        throw new Error("Invalid chain types");
      }

      const btcNetwork = networkConfig?.network;
      const btcPubkey = walletInfo.pubkey;
      const btcAddress = walletInfo.address;
      const currentChains = protocol?.chains || [];

      const [destination] = currentChains.filter((c) => c.chain === chainSeleted);

      validateRequiredFields({
        vault,
        btcNetwork,
        protocol,
        walletProvider,
        destChain: chainSeleted,
        custodians: protocol?.custodian_group?.custodians,
        quorum: protocol?.custodian_group?.quorum,
        btcPubkey,
        btcAddress
      });

      if ((protocol?.custodian_group?.quorum ?? 0) < 1) {
        throw new Error("Quorum must be greater than 0");
      }

      const addressUtxos = await walletProvider?.getUtxos(btcAddress, Number(parseTransferAmount));

      if (!addressUtxos) throw new Error("Not enough UTXOs");

      const txData = {
        utxos: addressUtxos.map((utxo) => ({ ...utxo, status: {} as any })),
        // TODO: apply dynamic feerates

        // feeRate:
        //   data.btcFeeRate === "customFee"
        //     ? (data.customFeeRate ?? feeRates.fastestFee)
        //     : feeRates.minimumFee,

        feeRate: feeRates.minimumFee,
        addresses: {
          btcUserPk: hexToBytes(btcPubkey),
          destinationRecipient: hexToBytesViem(values.destRecipientAddress as Hex),
          destinationToken: hexToBytesViem(destination.address as Hex)
        }
      };

      const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
        protocol?.custodian_group?.custodians || []
      );

      const chainID = getChainID(chainSeleted);
      if (!chainID) throw new Error("Invalid destination chain");

      const destinationChain = new DestinationChain(ChainType.EVM, BigInt(chainID));

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
        rbf: true
      };

      const result = vault?.buildCustodianOnlyStakingPsbt(psbtFormData);
      if (!result) throw new Error("Failed to build the PSBT");
      const { psbt: unsignedVaultPsbt } = result;

      const signedPsbt = await walletProvider?.signPsbt(unsignedVaultPsbt.toHex(), {
        autoFinalized: true
      });

      if (!signedPsbt) throw new Error("Failed to sign the PSBT");

      const txHex = bitcoin.Psbt.fromHex(signedPsbt).extractTransaction().toHex();
      const txId = await walletProvider?.pushTx(txHex);
      if (!txId) throw new Error("Failed to push the PSBT");

      showSuccessTx(txId, protocol?.asset?.chain as string);
    } catch (error) {
      sonnerToast.error((error as Error).message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const [_, chainSeleted] = destinationChainForm?.split("-") || [];
    const [newProtocol] =
      data?.protocols?.filter((p) => (p.chains?.filter((c) => c.chain === chainSeleted) || []).length > 0) ||
      [];
    setProtocol(newProtocol);
  }, [destinationChainForm, data]);

  useEffect(() => {
    if (
      transferAmountForm &&
      parseSats(Number(transferAmountForm).toFixed(BTC_DECIMALS)) > Number(walletInfo.balance)
    ) {
      setError("transferAmount", {
        type: "manual",
        message: "Amount exceeds available balance"
      });
    } else {
      clearErrors("transferAmount");
    }
  }, [transferAmountForm, walletInfo.balance, setError, clearErrors]);

  const selectOptions: TSelectSearchGroup[] = useMemo(
    () =>
      data?.protocols
        ? data.protocols.map(({ asset, avatar, scalar_address, chains }) => ({
            groupLabel: (
              <div className='flex items-center gap-2'>
                <Base64Icon url={avatar} className='size-6' />
                <span className='font-semibold text-base'>{asset?.symbol}</span>
              </div>
            ),
            key: scalar_address || "",
            items:
              chains?.map(({ name, chain }) => ({
                value: `${asset?.symbol}-${chain}`,
                label: (
                  <ChainIcon
                    chain={chain as SupportedChains}
                    showName
                    customName={name}
                    classNames={{ icon: "size-5", name: "text-base" }}
                  />
                ),
                hideValue: name || Chains[chain as SupportedChains]?.name
              })) || []
          }))
        : [],
    [data?.protocols]
  );

  return (
    <Card className='mx-auto w-full max-w-2xl border-none shadow-none'>
      {/* <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="font-bold text-xl">Bridge</CardTitle>
      </CardHeader> */}
      <CardContent className='px-0'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* From Section */}
            <FormField
              control={form.control}
              name='transferAmount'
              render={({ field }) => (
                <FormItem className='space-y-1 rounded-lg bg-background-secondary p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <FormLabel className='text-base'>From</FormLabel>
                    <ChainIcon chain={btcChain.chain} showName classNames={{ wrapper: "gap-1" }} />
                  </div>
                  <div className='flex items-center gap-2 rounded-lg'>
                    <div className='flex flex-1 flex-col gap-2'>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          placeholder='Please enter the amount'
                          className='!text-base rounded-none border-0 border-accent border-b-2 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0'
                        />
                      </FormControl>
                    </div>
                    {/* <div className="flex gap-1">
                      <ChainIcon chain={btcChain.chain} />
                      tBTC
                    </div> */}
                  </div>
                  <p className='text-right text-base text-text-primary-500/50'>
                    Available wallet: {formatBTC(walletInfo.balance)} BTC
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Section */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='destinationChain'
                render={({ field: { value, onChange } }) => (
                  <FormItem className='space-y-4 rounded-lg bg-background-secondary p-4'>
                    <div className='flex items-center gap-2 rounded-lg'>
                      <div className='flex flex-1 flex-col gap-2'>
                        <div className='flex items-center justify-between gap-2'>
                          <FormLabel className='text-base'>To</FormLabel>
                          <SelectSearch
                            value={value}
                            onChange={onChange}
                            placeholder='Select Token'
                            options={selectOptions}
                            classNames={{
                              command: {
                                group: "py-1",
                                list: "max-h-60"
                              }
                            }}
                            searchByHideValue
                          />
                        </div>
                        <span className='text-base'>{watch("transferAmount") || 0}</span>
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

            {walletInfo.isConnected ? (
              <Button
                type='submit'
                size='lg'
                className='w-full'
                disabled={!walletInfo.balance}
                isLoading={isLoading}
              >
                Submit
              </Button>
            ) : (
              <Popover>
                <PopoverTrigger className='w-full' asChild>
                  <Button type='button' size='lg'>
                    Connect wallet
                  </Button>
                </PopoverTrigger>
                <PopoverContent side='top' className='rounded-lg p-2'>
                  <ConnectBtc hideTitle />
                </PopoverContent>
              </Popover>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
