import { Clipboard, If } from "@/components/common";
import { formatBTC } from "@/lib/utils";
import { WalletProvider, walletList } from "@/lib/wallet";
import { useWalletInfo, useWalletProvider } from "@/providers/wallet-provider";
import { Power } from "lucide-react";
import { createElement, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// And whether or not it should be injected
const BROWSER = "btcwallet" as keyof typeof window;

export const ConnectBtc = ({ hideTitle }: { hideTitle?: boolean }) => {
  const walletInfo = useWalletInfo();

  const [selectedWallet, setSelectedWallet] = useState<string | undefined>();

  const { setWalletProvider, connectWallet, disconnectWallet, networkConfig } = useWalletProvider();

  const isInjectable = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !!window[BROWSER];
  }, []);

  useEffect(() => {
    try {
      if (selectedWallet) {
        let walletInstance: WalletProvider;

        if (selectedWallet === BROWSER) {
          if (!isInjectable) {
            throw new Error("Browser selected without an injectable interface");
          }
          // we are using the browser wallet
          walletInstance = window[BROWSER];
        } else {
          // we are using a custom wallet
          const walletProvider = walletList.find((w) => w.name === selectedWallet)?.wallet;
          if (!walletProvider) {
            throw new Error("Wallet provider not found");
          }
          walletInstance = new (walletProvider as any)();
        }
        setWalletProvider(walletInstance);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  }, [setWalletProvider, selectedWallet, isInjectable]);

  return (
    <div className='flex w-full flex-col gap-2'>
      <If condition={!hideTitle}>
        <div className='flex items-center justify-between gap-2'>
          <span className='font-semibold text-lg'>BTC</span>
          <If condition={walletInfo.isConnected}>
            <button type='button' onClick={disconnectWallet} className='cursor-pointer'>
              <Power className='size-5' />
            </button>
          </If>
        </div>{" "}
      </If>
      <If
        condition={walletInfo.isConnected}
        fallback={
          <div className='space-y-2'>
            {walletList.map(({ provider, name, icon }) => {
              if (!provider) {
                return null;
              }

              return (
                <button
                  key={name}
                  className='flex w-full cursor-pointer items-center gap-2 bg-[#E3E3E3] p-2'
                  type='button'
                  onClick={() => {
                    setSelectedWallet(name);
                    connectWallet();
                  }}
                >
                  {createElement(icon, {
                    className: "size-8 rounded-full object-cover bg-white p-1 shadow-md"
                  })}
                  <span className='text-base'>{name}</span>
                </button>
              );
            })}
          </div>
        }
      >
        <div className='space-y-1 text-base'>
          <div className='flex items-center justify-between gap-1'>
            <span>Wallet address</span>
            <Clipboard
              label={walletInfo.address}
              text={walletInfo.address}
              classNames={{ wrapper: "max-w-[100px]" }}
            />
          </div>
          <div className='flex items-center justify-between gap-1'>
            <span>Balance</span>
            <span className='font-semibold'>{formatBTC(walletInfo.balance)} BTC</span>
          </div>
          <If condition={networkConfig?.network}>
            {(network) => (
              <div className='flex items-center justify-between gap-1'>
                <span>Network</span>
                <span className='font-semibold'>{network}</span>
              </div>
            )}
          </If>
        </div>
      </If>
    </div>
  );
};
