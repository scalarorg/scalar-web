import { networks } from "bitcoinjs-lib";
import { Network } from "./wallet-provider";

const NETWORK_OBJECTS = {
  [Network.MAINNET]: networks.bitcoin,
  [Network.TESTNET]: networks.testnet,
  [Network.REGTEST]: networks.regtest,
  [Network.TESTNET4]: networks.testnet
};

export const toNetwork = (network: Network): networks.Network => {
  const networkObject = NETWORK_OBJECTS[network];

  if (!networkObject) {
    throw new Error("Unsupported network");
  }

  return networkObject;
};

const nativeSegwitAddressLength = 42;
const regtestSegwitAddressLength = 44;
const taprootAddressLength = 62;

export const isSupportedAddressType = (address: string): boolean => {
  return (
    address.length === nativeSegwitAddressLength ||
    address.length === regtestSegwitAddressLength ||
    address.length === taprootAddressLength
  );
};

const BYTES_IN_KB = 1024;

export const convertToBytes = (value: number, unit: "B" | "KB" | "MB" | "GB" | "TB"): number => {
  const unitMap: Record<string, number> = {
    B: 1,
    KB: BYTES_IN_KB,
    MB: BYTES_IN_KB ** 2,
    GB: BYTES_IN_KB ** 3,
    TB: BYTES_IN_KB ** 4
  };

  return value * (unitMap[unit] || 1);
};
