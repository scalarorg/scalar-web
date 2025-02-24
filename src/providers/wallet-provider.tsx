import { NetworkConfig, getNetworkConfig } from "@/config/nework.config";
import {
  WalletProvider as TWalletProvider,
  WalletError,
  WalletErrorType,
  isSupportedAddressType,
  toNetwork,
  walletList,
} from "@/lib/wallet";
import { useError } from "@/providers/error-provider";
import { useNetwork } from "@/providers/network-provider";
import { ErrorState } from "@/types/errors";
import { BtcMempool } from "@scalar-lab/bitcoin-vault";
import { networks } from "bitcoinjs-lib";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const useWalletProvider = () => {
  const ctx = useContext(WalletProviderContext);
  if (!ctx) {
    throw new Error("useWalletProvider must be used within a WalletProvider");
  }
  return {
    walletProvider: ctx.walletProvider,
    networkConfig: ctx.networkConfig,
    setWalletProvider: ctx.setWalletProvider,
    connectWallet: ctx.connectWallet,
    disconnectWallet: ctx.disconnectWallet,
    btcNetwork: ctx.btcNetwork,
    mempoolClient: ctx.mempoolClient,
  };
};

export const useWalletInfo = () => {
  const ctx = useContext(WalletProviderContext);
  if (!ctx) {
    throw new Error("useWalletInfo must be used within a WalletProvider");
  }

  return ctx.walletInfo;
};

const WalletProviderContext = createContext<{
  walletInfo: {
    balance: number;
    address: string;
    pubkey: string;
    isConnected: boolean;
  };
  setWalletInfo: (walletInfo: {
    balance: number;
    address: string;
    pubkey: string;
    isConnected: boolean;
  }) => void;
  walletProvider?: TWalletProvider;
  setWalletProvider: (walletProvider: TWalletProvider) => void;
  networkConfig?: NetworkConfig;
  setNetworkConfig: (networkConfig: NetworkConfig) => void;
  disconnectWallet: () => void;
  connectWallet: () => void;
  btcNetwork?: networks.Network;
  setBtcNetwork: (btcNetwork: networks.Network) => void;
  mempoolClient?: BtcMempool | undefined;
} | null>(null);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletInfo, setWalletInfo] = useState({
    balance: 0,
    address: "",
    pubkey: "",
    isConnected: false,
  });
  const [walletProvider, setWalletProvider] = useState<TWalletProvider>();
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>();
  const [btcNetwork, setBtcNetwork] = useState<networks.Network>();
  const [mempoolClient, setMempoolClient] = useState<BtcMempool | undefined>();

  const initProvider = useCallback(() => {
    const btcNetwork = toNetwork(globalNetwork);
    const config = getNetworkConfig(globalNetwork);
    const client = new BtcMempool(`${config.mempoolApiUrl}/api`);

    setBtcNetwork(btcNetwork);
    setNetworkConfig(config);
    setMempoolClient(client);
  }, []);

  const { network: globalNetwork } = useNetwork();
  const { showError } = useError();

  const connectWallet = useCallback(async () => {
    if (!walletProvider) {
      return;
    }

    try {
      await walletProvider.connectWallet(globalNetwork);
      const address = await walletProvider.getAddress();

      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taproot",
        );
      }

      const balanceSat = await walletProvider.getBalance();
      const pubKeyHex = await walletProvider.getPublicKeyHex();
      setWalletInfo({
        balance: balanceSat,
        address,
        pubkey: pubKeyHex,
        isConnected: true,
      });

      initProvider();
    } catch (error: unknown) {
      if (
        error instanceof WalletError &&
        error.getType() === WalletErrorType.ConnectionCancelled
      ) {
        // User cancelled the connection, hence do nothing
        return;
      }
      showError({
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          errorState: ErrorState.WALLET,
          errorTime: new Date(),
        },
        retryAction: () => connectWallet(),
      });
    }
  }, [globalNetwork, showError, walletProvider, initProvider]);

  const disconnectWallet = useCallback(async () => {
    if (!walletProvider) {
      return;
    }

    setNetworkConfig(undefined);
    setWalletInfo({
      balance: 0,
      address: "",
      pubkey: "",
      isConnected: false,
    });
    await walletProvider.disconnect();
  }, [walletProvider]);

  useEffect(() => {
    if (walletProvider) {
      const getInfo = async () => {
        try {
          const info = await walletProvider.init();
          setWalletInfo({
            ...info,
            balance: info.balance,
            isConnected: !!(info.address && info.pubkey),
          });
        } catch (error) {
          console.error(error);
        }
      };

      getInfo();
    }
  }, [walletProvider]);

  useEffect(() => {
    initProvider();
  }, [initProvider]);

  useEffect(() => {
    const walletProvider = walletList.find((w) => w.name === "Unisat")?.wallet;
    if (!walletProvider) {
      throw new Error("Wallet provider not found");
    }
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const walletInstance = new (walletProvider as any)();

    setWalletProvider(walletInstance);
  }, []);

  return (
    <WalletProviderContext.Provider
      value={{
        walletInfo,
        setWalletInfo,
        walletProvider,
        setWalletProvider,
        networkConfig,
        setNetworkConfig,
        disconnectWallet,
        connectWallet,
        btcNetwork,
        setBtcNetwork,
        mempoolClient,
      }}
    >
      {children}
    </WalletProviderContext.Provider>
  );
};

export default memo(WalletProvider);
