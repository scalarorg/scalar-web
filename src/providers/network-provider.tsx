import { Network } from "@/lib/wallet";
import { ReactNode, createContext, memo, useContext, useState } from "react";

const NetworkProviderContext = createContext<{
  network: Network;
  setNetwork: (network: Network) => void;
} | null>(null);

export const useNetwork = () => {
  const context = useContext(NetworkProviderContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }

  return context;
};

const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<Network>(Network.TESTNET4);

  return (
    <NetworkProviderContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      {children}
    </NetworkProviderContext.Provider>
  );
};

export default memo(NetworkProvider);
