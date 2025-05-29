import UnisatIcon from './icons/unisat.svg';
import { UnisatWallet, unisatProvider } from './providers/unisat-wallet';
import { Network } from './wallet-provider';

interface IntegratedWallet {
  name: string;
  icon: string;
  wallet: unknown;
  linkToDocs: string;
  provider?: string;
  isQRWallet?: boolean;
  supportedNetworks?: Network[];
}

// Special case for the browser wallet. i.e injected wallet
export const BROWSER_INJECTED_WALLET_NAME = 'Browser';

export const walletList: IntegratedWallet[] = [
  {
    name: 'Unisat',
    icon: UnisatIcon,
    wallet: UnisatWallet,
    provider: unisatProvider,
    linkToDocs: 'https://unisat.io/download',
    supportedNetworks: [Network.MAINNET, Network.TESTNET4]
  }
];
