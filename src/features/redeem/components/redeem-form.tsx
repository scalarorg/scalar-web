import { ChainIcon, If, SelectSearch, TSelectSearchGroup } from '@/components/common';
import { ConnectBtc, ConnectEvm } from '@/components/connect';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectTokens } from '@/components/ui/select-tokens';
import { toast } from '@/components/ui/use-toast';
import {
  useERC20,
  useFeeRates,
  useGateway,
  useGatewayContract,
  useScalarProtocols,
  useScalarStandaloneCommandResult,
  useVault
} from '@/hooks';
import { useEthersSigner } from '@/lib/ethers';
import { decodeScalarBytesToString, decodeScalarBytesToUint8Array } from '@/lib/scalar';
import { EventType } from '@/lib/scalar/events';
import { ReserveRedeemUtxoParams } from '@/lib/scalar/params';
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
  validateTransferConfig
} from '@/lib/utils';
import { getWagmiChain, isSupportedChain } from '@/lib/wagmi';
import { useKeplrClient, useAccount as useScalarAccount } from '@/providers/keplr-provider';
import { useWalletInfo, useWalletProvider } from '@/providers/wallet-provider';
import { SupportedChains, isCommingChains } from '@/types/chains';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TBuildUPCUnstakingPsbt,
  bytesToHex,
  calculateContractCallWithTokenPayload,
  hexToBytes
} from '@scalar-lab/bitcoin-vault';
import { useQuery } from '@tanstack/react-query';
import * as bitcoin from 'bitcoinjs-lib';
import { isNil } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast as sonnerToast } from 'sonner';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { TRedeemForm, redeemFormSchema } from '../schemas';

const getChainSelected = (value = '') => {
  const [_, chain] = value.split('-') || [];

  return chain;
};

export const RedeemForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { address: evmAddress, isConnected: isConnectedEvm } = useAccount();
  const { data: scalarClient, isLoading: isScalarClientLoading } = useKeplrClient();
  const { account: scalarAccount } = useScalarAccount();

  const form = useForm<TRedeemForm>({
    resolver: zodResolver(redeemFormSchema)
  });

  const { control, watch, setError, clearErrors, handleSubmit } = form;
  const watchForm = watch();

  const { pubkey: btcPubkey, address: btcAddress, isConnected: isConnectedBtc } = useWalletInfo();
  const {
    data: { protocols = [] } = {}
  } = useScalarProtocols();
  const { networkConfig, btcNetwork, mempoolClient, walletProvider } = useWalletProvider();

  const feeRates = useFeeRates(btcAddress, mempoolClient);
  const filterProtocols = protocols.filter((p) => isBtcChain(p?.asset?.chain));

  const selectOptions: TSelectSearchGroup[] = useMemo(
    () => SelectTokens({ protocols: filterProtocols }),
    [filterProtocols]
  );

  const selectedProtocol = filterProtocols.find((p) =>
    p?.chains?.find((c) => `${p?.asset?.symbol}-${c?.chain}` === watchForm.sourceChain)
  );

  const vault = useVault(selectedProtocol?.tag ? decodeScalarBytesToString(selectedProtocol.tag) : undefined);

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
      selectedProtocol.custodian_group.custodians
    );

    const userPubkey = hexToBytes(btcPubkey.replace('0x', ''));

    const protocolPubkey = decodeScalarBytesToUint8Array(selectedProtocol.bitcoin_pubkey);

    const script = vault.upcLockingScript({
      userPubkey,
      protocolPubkey,
      custodianPubkeys: custodianPubkeysBufferArray,
      custodianQuorum: selectedProtocol.custodian_group.quorum
    });

    return Buffer.from(script);
  }, [vault, btcNetwork, selectedProtocol, btcPubkey]);

  const upcLockingAddress = useMemo(() => {
    if (!upcLockingScript) return null;
    return bitcoin.address.fromOutputScript(upcLockingScript, btcNetwork);
  }, [upcLockingScript, btcNetwork]);

  const { data: unstakeableUtxos } = useQuery({
    queryKey: [
      'selectedUnstakableUtxos',
      upcLockingAddress,
      selectedProtocol?.asset,
      sourceChainSelected,
      watchForm.transferAmount
    ],
    queryFn: async () => {
      const satsAmount = parseSats(watchForm.transferAmount ? String(watchForm.transferAmount) : '');

      if (!isBtcChain(selectedProtocol?.asset?.chain))
        return {
          utxos: [],
          total: BigInt(0)
        };

      let addressUtxos = await mempoolClient?.addresses.getAddressTxsUtxo({
        address: upcLockingAddress as string
      });

      addressUtxos = addressUtxos?.sort((a, b) => b.value - a.value || b.txid.localeCompare(a.txid));
      if (!addressUtxos)
        return {
          utxos: [],
          total: BigInt(0)
        };

      let totalNeeded = 0;
      let totalAvailable = 0;
      const utxos = [];
      for (const utxo of addressUtxos) {
        if (!utxo.status.confirmed) {
          continue;
        }
        if (totalNeeded < satsAmount) {
          utxos.push(utxo);
          totalNeeded += utxo.value;
        }
        totalAvailable += utxo.value;
      }

      return {
        utxos: utxos,
        total: BigInt(totalAvailable)
      };
    },
    enabled: !!(upcLockingAddress && mempoolClient)
  });

  const { data: gateway } = useGateway(sourceChainSelected);
  const { callContractWithToken } = useGatewayContract(gateway?.address as `0x${string}`);

  const tokenAddress = selectedProtocol?.chains?.find((c) => c.chain === sourceChainSelected)?.address;

  const {
    balanceOf,
    checkAllowance,
    approve: approveERC20,
    decimals
  } = useERC20(tokenAddress as `0x${string}`);

  const { data: sourceChainTokenBalance } = useQuery({
    queryKey: [
      'sourceChainTokenBalance',
      sourceChainSelected,
      selectedProtocol?.asset,
      chainId,
      evmAddress ?? ''
    ],
    queryFn: async () => {
      const balance = await balanceOf(evmAddress as `0x${string}`);
      return balance || BigInt(0);
    },
    enabled:
      !!evmAddress &&
      !!sourceChainSelected &&
      !!selectedProtocol?.asset &&
      isEvmChain(sourceChainSelected) &&
      Number(getChainID(sourceChainSelected)) === chainId
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
    if (watchForm.transferAmount && sourceChainTokenBalance && decimals) {
      if (parseUnits(String(watchForm.transferAmount), Number(decimals)) > sourceChainTokenBalance) {
        setError('transferAmount', {
          type: 'manual',
          message: 'Amount exceeds available balance'
        });
      } else {
        clearErrors('transferAmount');
      }
    }
  }, [decimals, watchForm.transferAmount, sourceChainTokenBalance, setError, clearErrors]);

  const showSuccessTx = useCallback(
    (txid: string, chain: string) => {
      let link = '';
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
        title: 'Transfer transaction successful',
        description: (
          <div className='mt-2 w-160 rounded-md'>
            <p className='text-white'>
              Txid:{' '}
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

  const { startPolling } = useScalarStandaloneCommandResult();

  const signer = useEthersSigner();

  const onSubmit = async (values: TRedeemForm) => {
    setIsLoading(true);
    try {
      if (selectedProtocol?.attributes?.model === 'LIQUIDITY_MODEL_POOL') {
        if (isScalarClientLoading || !scalarAccount || !scalarClient) {
          throw new Error('Please connect to Scalar');
        }
      }
      validateTransferConfig(tokenAddress, gateway);

      const sourceChain = getChainSelected(values.sourceChain);

      if (!isEvmChain(sourceChain) || !isBtcChain(selectedProtocol?.asset?.chain)) {
        throw new Error('Invalid chain types');
      }

      const newTransferAmount = parseUnits(String(values.transferAmount), Number(decimals));

      if ((sourceChainTokenBalance || 0n) < BigInt(newTransferAmount)) {
        throw new Error('Insufficient balance');
      }

      if (!evmAddress) {
        throw new Error('Invalid EVM address');
      }

      await handleTokenApproval({
        owner: evmAddress,
        gatewayAddress: gateway?.address as `0x${string}`,
        transferAmount: BigInt(newTransferAmount),
        checkAllowance,
        approveERC20
      });

      const redeemLockingScript = bitcoin.address.toOutputScript(values.destRecipientAddress, btcNetwork);

      let payload = '';

      if (selectedProtocol?.attributes?.model === 'LIQUIDITY_MODEL_POOL') {
        if (!scalarAccount?.address) {
          throw new Error('Invalid Scalar address');
        }

        const lockingScript = Buffer.from(redeemLockingScript).toString('hex');

        const params: ReserveRedeemUtxoParams = {
          sender: scalarAccount.address,
          address: evmAddress,
          source_chain: sourceChain,
          dest_chain: selectedProtocol.asset?.chain!,
          symbol: selectedProtocol.asset?.symbol,
          amount: parseSats(values.transferAmount.toString()).toString(),
          locking_script: lockingScript
        };

        const result = await scalarClient?.raw.reserveRedeemUtxo(scalarAccount.address, params, 'auto', '');

        const event = result?.events.find((e) => e.type === EventType.ReserveRedeemUtxo);
        if (!event) {
          throw new Error('Failed to redeem UPC');
        }

        const command = event.attributes.find(
          (a) => a.key === Buffer.from('commandId', 'ascii').toString('base64')
        );

        if (!command) {
          throw new Error('Failed to redeem UPC');
        }

        const commandId = Buffer.from(command.value, 'base64').toString('ascii');

        const commandRs = await startPolling({
          hex: commandId,
          validator: (data) => data.status === 'STANDALONE_COMMAND_STATUS_SIGNED'
        });
        if (!command) {
          throw new Error('Failed to redeem UPC');
        }

        if (!commandRs.execute_data) {
          throw new Error('Execute data not found');
        }

        const payload = commandRs.execute_data;

        const response = await signer?.sendTransaction({
          to: gateway?.address as `0x${string}`,
          data: payload.startsWith('0x') ? payload : `0x${payload}`,
          value: 0
        });

        // wait for tx to be mined
        await response?.wait();
        showSuccessTx(response?.hash as string, sourceChain);
        return;
      }

      if (!unstakeableUtxos?.utxos || !unstakeableUtxos?.utxos.length) {
        throw new Error('Not enough balances');
      }

      if (!upcLockingScript) {
        throw new Error('Invalid locking script');
      }

      const protocolPubkey = decodeScalarBytesToUint8Array(selectedProtocol?.bitcoin_pubkey!);

      const custodianPubkeys = prepareCustodianPubkeysArray(selectedProtocol?.custodian_group?.custodians!);

      const custodianQuorum = selectedProtocol?.custodian_group?.quorum!;
      const stakerPubkey = hexToBytes(btcPubkey.replace('0x', ''));

      const params: TBuildUPCUnstakingPsbt = {
        inputs: unstakeableUtxos.utxos?.map((tx) => ({
          txid: tx.txid,
          vout: VOUT_INDEX_OF_LOCKING_OUTPUT,
          value: BigInt(tx.value),
          script_pubkey: Uint8Array.from(upcLockingScript)
        })),
        output: {
          script: redeemLockingScript,
          value: newTransferAmount
        },
        stakerPubkey,
        protocolPubkey,
        custodianPubkeys,
        custodianQuorum,
        feeRate: BigInt(feeRates.minimumFee),
        rbf: true,
        type: 'user_custodian'
      };

      const unsignedPsbtHex = vault?.buildUPCUnstakingPsbt(params);

      const hexPsbt = bytesToHex(unsignedPsbtHex!);

      const signedPsbt = await walletProvider?.signPsbt(hexPsbt, {
        autoFinalized: false,
        toSignInputs: params.inputs.map((_input, index) => ({
          index,
          address: btcAddress,
          disableTweakSigner: true
        }))
      });

      payload = calculateContractCallWithTokenPayload({
        type: 'upc',
        upc: {
          psbt: `0x${signedPsbt}`
        }
      });

      const contractCallTx = await callContractWithToken({
        destinationChain: selectedProtocol?.asset?.chain!,
        destinationContractAddress: EMPTY_ADDRESS,
        payload,
        symbol: selectedProtocol?.asset?.symbol || '',
        amount: BigInt(newTransferAmount)
      });

      if (!contractCallTx) {
        throw new Error('Initializing transfer failed');
      }

      const contractCallConfirmed = await Promise.race([
        new Promise((_, reject) => setTimeout(() => reject(new Error('Transfer timeout')), 60000)),
        contractCallTx.wait()
      ]);

      if (contractCallConfirmed) {
        showSuccessTx(contractCallTx.hash, sourceChain);
      } else {
        throw new Error('Transfer failed');
      }
    } catch (error) {
      sonnerToast.error((error as Error).message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-2xl border-none shadow-none'>
      <CardContent className='px-0'>
        <Form {...form}>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {/* From Section */}
            <div className='space-y-1 rounded-lg bg-background-secondary p-4'>
              <FormField
                control={control}
                name='sourceChain'
                render={({ field: { value, onChange } }) => (
                  <FormItem className='mb-3'>
                    <div className='flex items-center gap-2 rounded-lg'>
                      <div className='flex flex-1 flex-col gap-2'>
                        <div className='flex items-center justify-between gap-2'>
                          <FormLabel className='text-base'>From</FormLabel>
                          <SelectSearch
                            value={value}
                            onChange={(val) => {
                              const parsedVal = val.split('-')[1];
                              if (isCommingChains(parsedVal as SupportedChains)) return;
                              onChange(val);
                            }}
                            placeholder='Select Token'
                            options={selectOptions}
                            searchByHideValue
                            classNames={{
                              command: {
                                group: 'py-1',
                                list: 'max-h-60'
                              }
                            }}
                            showGroupLabelOfValue
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
                <span>Redeemable amount:</span>{' '}
                <span className='mr-1 border-text-primary-500/50 border-r-2 pr-1'>
                  {unstakeableUtxos ? formatBTC(unstakeableUtxos?.total) : 0} BTC
                </span>
                <span>
                  {!isNil(sourceChainTokenBalance)
                    ? formatUnits(sourceChainTokenBalance, Number(decimals))
                    : 0}
                </span>
                <If condition={selectedProtocol?.asset?.symbol}>{(symbol) => <span> {symbol}</span>}</If>
              </p>
            </div>

            {/* To Section */}
            <p className='flex items-center justify-between gap-2 rounded-lg bg-background-secondary p-4 text-base'>
              To{' '}
              <If condition={selectedProtocol?.asset?.chain}>
                {(chain) => (
                  <ChainIcon chain={chain as SupportedChains} showName classNames={{ wrapper: 'gap-1' }} />
                )}
              </If>
            </p>

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

            <If condition={isConnectedEvm} fallback={<ConnectEvm hideTitle />}>
              <If
                condition={selectedProtocol?.attributes?.model === 'LIQUIDITY_MODEL_UPC' && !isConnectedBtc}
                fallback={
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={!sourceChainTokenBalance}
                    isLoading={isLoading}
                    size='lg'
                  >
                    Redeem
                  </Button>
                }
              >
                <Popover>
                  <PopoverTrigger className='w-full' asChild>
                    <Button type='button' className='w-full' size='lg'>
                      Connect wallet
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side='top'>
                    <ConnectBtc hideTitle />
                  </PopoverContent>
                </Popover>
              </If>
            </If>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
