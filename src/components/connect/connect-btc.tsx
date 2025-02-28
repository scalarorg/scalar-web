import { Clipboard } from "@/components/common";
import { formatBTC } from "@/lib/utils";
import { WalletProvider, walletList } from "@/lib/wallet";
import { useWalletInfo, useWalletProvider } from "@/providers/wallet-provider";
import { Power } from "lucide-react";
import { createElement, useEffect, useMemo, useState } from "react";

// And whether or not it should be injected
const BROWSER = "btcwallet" as keyof typeof window;

export const ConnectBtc = ({ hideTitle }: { hideTitle?: boolean }) => {
  const walletInfo = useWalletInfo();

  const [selectedWallet, setSelectedWallet] = useState("Unisat");

  const { setWalletProvider, connectWallet, disconnectWallet, networkConfig } =
    useWalletProvider();

  const isInjectable = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !!window[BROWSER];
  }, []);

  useEffect(() => {
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
        const walletProvider = walletList.find(
          (w) => w.name === selectedWallet,
        )?.wallet;
        if (!walletProvider) {
          throw new Error("Wallet provider not found");
        }
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        walletInstance = new (walletProvider as any)();
      }
      setWalletProvider(walletInstance);
    }
  }, [setWalletProvider, selectedWallet, isInjectable]);

  return (
    <div className="flex w-full flex-col gap-2">
      {!hideTitle && (
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[22px]">BTC</span>
          {walletInfo.isConnected && (
            <button
              type="button"
              onClick={disconnectWallet}
              className="cursor-pointer"
            >
              <Power className="size-5" />
            </button>
          )}
        </div>
      )}
      {walletInfo.isConnected ? (
        <div className="space-y-1 text-[18px]">
          <div className="flex items-center justify-between gap-1">
            <span>Wallet address</span>
            <Clipboard
              className="[&_span]:text-[18px]"
              label={walletInfo.address}
              text={walletInfo.address}
            />
          </div>
          <div className="flex items-center justify-between gap-1">
            <span>Balance</span>
            <span className="font-semibold">
              {formatBTC(walletInfo.balance)} BTC
            </span>
          </div>
          {networkConfig?.network && (
            <div className="flex items-center justify-between gap-1">
              <span>Network</span>
              <span className="font-semibold">{networkConfig.network}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {walletList.map(({ provider, name, icon }) => {
            if (!provider) {
              return null;
            }

            return (
              <button
                key={name}
                className="flex w-full cursor-pointer items-center gap-2 bg-[#E3E3E3] p-2"
                type="button"
                onClick={() => {
                  setSelectedWallet(name);
                  connectWallet();
                }}
              >
                {createElement(icon, {
                  className:
                    "size-9 rounded-full object-cover bg-white p-1 shadow-md",
                })}
                <span className="text-lg">{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
