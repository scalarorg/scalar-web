import { Network } from "@/lib/wallet";

const mempoolApiUrl = import.meta.env.VITE_MEMPOOL_API;

export interface NetworkConfig {
  coinName: string;
  coinSymbol: string;
  networkName: string;
  mempoolApiUrl: string;
  network: Network;
}

const mainnetConfig: NetworkConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl,
  network: Network.MAINNET,
};

const testnetConfig: NetworkConfig = {
  coinName: "Testnet BTC",
  coinSymbol: "tBTC",
  networkName: "BTC testnet",
  mempoolApiUrl: `${mempoolApiUrl}/testnet`,
  network: Network.TESTNET,
};

const testnet4Config: NetworkConfig = {
  coinName: "Testnet BTC",
  coinSymbol: "tBTC",
  networkName: "BTC testnet4",
  mempoolApiUrl: `${mempoolApiUrl}/testnet4`,
  network: Network.TESTNET4,
};

const regtestConfig: NetworkConfig = {
  coinName: "Regtest BTC",
  coinSymbol: "rBTC",
  networkName: "BTC regtest",
  mempoolApiUrl,
  network: Network.REGTEST,
};

const config: Record<Network, NetworkConfig> = {
  mainnet: mainnetConfig,
  testnet: testnetConfig,
  testnet4: testnet4Config,
  regtest: regtestConfig,
};

export function getNetworkConfig(network = Network.TESTNET4): NetworkConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.TESTNET:
      return config.testnet;
    case Network.TESTNET4:
      return config.testnet4;
    case Network.REGTEST:
      return config.regtest;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

export function validateAddress(network: Network, address: string): void {
  if (network === Network.MAINNET && !address.startsWith("bc1")) {
    throw new Error(
      "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'.",
    );
  }
  if (
    [Network.TESTNET, Network.TESTNET4].includes(network) &&
    !address.startsWith("tb1")
  ) {
    throw new Error(
      "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'.",
    );
  }
  if (![Network.MAINNET, Network.TESTNET, Network.TESTNET4].includes(network)) {
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
