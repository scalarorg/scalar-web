import { networks } from 'bitcoinjs-lib';
import { Network } from './wallet-provider';

const nativeSegwitAddressLength = 42;
const regtestSegwitAddressLength = 44;
const taprootAddressLength = 62;

export const toNetwork = (network: Network): networks.Network => {
  switch (network) {
    case Network.MAINNET:
      return networks.bitcoin;
    case Network.TESTNET:
      return networks.testnet;
    case Network.REGTEST:
      return networks.regtest;
    case Network.TESTNET4:
      return networks.testnet;
    default:
      throw new Error('Unsupported network');
  }
};

export const isSupportedAddressType = (address: string): boolean => {
  return (
    address.length === nativeSegwitAddressLength ||
    address.length === regtestSegwitAddressLength ||
    address.length === taprootAddressLength
  );
};

export const convertToBytes = (value: number, unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB'): number => {
  const unitMap: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4
  };

  return value * (unitMap[unit] || 1);
};
