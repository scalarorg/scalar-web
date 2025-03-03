import { formatTokenAmount } from "@/lib/utils";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { ChainInfo, Keplr } from "@keplr-wallet/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, use, useEffect, useState } from "react";
import { toast as toastSonner } from "sonner";

interface KeplrContextProps {
  config: ChainInfo;
  reconnectOnMount?: boolean;
  keplr: Keplr;
  isLoading: boolean;
  isInstalled: boolean;
}

const KeplrContext = createContext<KeplrContextProps | undefined>(undefined);

let _scalarClient: {
  raw: SigningStargateClient;
  offlineSigner: OfflineSigner;
} | null = null;

export const KeplrProvider: React.FC<
  React.PropsWithChildren<
    Omit<KeplrContextProps, "keplr" | "isLoading" | "isInstalled">
  >
> = ({ children, config, reconnectOnMount = false }) => {
  const [keplr, setKeplr] = useState<Keplr | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(
    function initKeplr() {
      const getKeplr = async () => {
        try {
          const keplr = await getKeplrFromWindow();
          setIsInstalled(!!keplr);

          if (!keplr) {
            // throw new Error("Please install Keplr");
            toastSonner(
              <p className="w-fit">
                You need to install Keplr on{" "}
                <a
                  href="https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Chrome Web Extension
                </a>
              </p>,
            );

            return;
          }

          if (!window.getOfflineSigner) {
            throw new Error("Please update Keplr");
          }

          setKeplr(keplr);
          if (reconnectOnMount) {
            await connectKeplr(keplr, config);
          }
        } catch (error) {
          toastSonner.error(
            error instanceof Error ? error.message : "Unknown error",
          );
        } finally {
          setIsLoading(false);
        }
      };

      getKeplr();

      return () => {
        if (keplr) {
          keplr.disable(config.chainId);
        }
      };
    },
    [config, keplr, reconnectOnMount],
  );

  if (isLoading) {
    return null;
  }

  return (
    <KeplrContext.Provider
      value={{
        config,
        reconnectOnMount,
        keplr: keplr!,
        isLoading,
        isInstalled,
      }}
    >
      {children}
    </KeplrContext.Provider>
  );
};

export const useKeplr = () => {
  const context = use(KeplrContext);
  if (!context) {
    throw new Error("useKeplr must be used within KeplrProvider");
  }
  return context;
};

export const useKeplrClient = () => {
  const { config, keplr, isInstalled, isLoading } = useKeplr();

  return useQuery({
    queryKey: ["keplr-client", config.chainId, keplr],
    queryFn: () => _scalarClient,
    enabled: !!_scalarClient && isInstalled && !isLoading,
  });
};

export const useConnectKeplr = () => {
  const { config, keplr } = useKeplr();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn: async () => {
      await connectKeplr(keplr, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["keplr-client", config.chainId, keplr],
      });
    },
  });

  return { ...result, connect: mutate, connectAsync: mutateAsync };
};

export const useDisconnectKeplr = () => {
  const { config, keplr } = useKeplr();
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn: async () => {
      if (keplr) {
        await keplr.disable(config.chainId);
      }
      _scalarClient = null;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["keplr-client", config.chainId, keplr],
      });
    },
  });

  return { ...result, disconnect: mutate, disconnectAsync: mutateAsync };
};

export const useAccount = () => {
  const { config, isInstalled, isLoading } = useKeplr();
  const { data: client } = useKeplrClient();

  const { data, ...result } = useQuery({
    queryKey: ["keplr-account", config.chainId, client?.offlineSigner],
    queryFn: async () => {
      const accounts = await client?.offlineSigner.getAccounts();
      const account = accounts?.[0];
      return {
        account,
        isConnected: Boolean(account),
      };
    },
    enabled: !!client && isInstalled && !isLoading,
  });

  return {
    ...result,
    account: data?.account,
    isConnected: data?.isConnected,
    isInstalled,
    isLoading,
  };
};

export const useBalance = () => {
  const { config } = useKeplr();
  const { data: client } = useKeplrClient();
  const { account, isConnected } = useAccount();
  return useQuery({
    queryKey: [
      "keplr-balance",
      config.chainId,
      client?.offlineSigner,
      account?.address,
    ],
    queryFn: async () => {
      const balance = await client?.raw.getBalance(account?.address!, "ascal");
      const formattedAmount = formatTokenAmount(BigInt(balance?.amount ?? "0"));
      return formattedAmount;
    },
    enabled: !!client && !!account && isConnected,
  });
};

const connectKeplr = async (keplr: Keplr, config: ChainInfo) => {
  if (!_scalarClient) {
    await keplr.experimentalSuggestChain(config);
    await keplr.enable(config.chainId);

    const offlineSigner = window!.getOfflineSigner!(config.chainId);
    _scalarClient = {
      raw: await SigningStargateClient.connectWithSigner(
        config.rpc,
        offlineSigner,
      ),
      offlineSigner,
    };
  }
  return _scalarClient;
};

const getKeplrFromWindow: () => Promise<Keplr | undefined> = async () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
