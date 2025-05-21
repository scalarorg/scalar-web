import { getNetworkConfig, validateAddress } from '@/config/nework.config';
import { getAddressBalance, getFundingUTXOs, getNetworkFees, getTipHeight, pushTx } from '@/lib/mempool-api';
import {
  Fees,
  INTERNAL_NETWORK_NAMES,
  Network,
  UTXO,
  UnisatOptions,
  WalletInfo,
  WalletProvider
} from '../wallet-provider';

// window object for Unisat Wallet extension
export const unisatProvider = 'unisat';

export class UnisatWallet extends WalletProvider {
  private unisatWalletInfo: WalletInfo | undefined;
  private unisatWallet: any;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an Unisat Wallet extension
    if (!window[unisatProvider as keyof typeof window]) {
      throw new Error('Unisat Wallet extension not found');
    }

    this.unisatWallet = window[unisatProvider as keyof typeof window];
    this.networkEnv = getNetworkConfig().network;

    // Unisat uses different providers for different networks
    this.bitcoinNetworkProvider = this.unisatWallet;
  }

  connectWallet = async (network = Network.TESTNET4): Promise<this> => {
    const workingVersion = '1.4.5';

    try {
      const version = await window[unisatProvider as keyof typeof window].getVersion();

      if (compareVersions(version, workingVersion) < 0) {
        throw new Error('Please update Unisat Wallet to the latest version');
      }

      switch (this.networkEnv) {
        case Network.MAINNET:
          await this.bitcoinNetworkProvider.switchNetwork(INTERNAL_NETWORK_NAMES.mainnet);
          break;
        case Network.TESTNET:
          await this.bitcoinNetworkProvider.switchNetwork(INTERNAL_NETWORK_NAMES.testnet);
          break;
        case Network.TESTNET4:
          await this.bitcoinNetworkProvider.switchNetwork(INTERNAL_NETWORK_NAMES.testnet);
          break;
        default:
          throw new Error('Unsupported network');
      }

      // try {
      //   await this.unisatWallet.enable(); // Connect to Unisat Wallet extension
      // } catch (error) {
      //   if ((error as Error)?.message?.includes("rejected")) {
      //     throw new Error("Connection to Unisat Wallet was rejected");
      //   } else {
      //     throw new Error((error as Error)?.message);
      //   }
      // }

      let result = null;
      try {
        // this will not throw an error even if user has no network enabled
        result = await this.bitcoinNetworkProvider.requestAccounts();
      } catch (error) {
        throw new Error(`BTC ${this.networkEnv} is not enabled in Unisat Wallet, ${error}`);
      }

      const address = result[0];

      validateAddress(network, address);

      const compressedPublicKey = await this.bitcoinNetworkProvider.getPublicKey();

      if (!compressedPublicKey || !address) {
        throw new Error('Could not connect to Unisat Wallet');
      }

      const balance = await this.bitcoinNetworkProvider.getBalance();

      this.unisatWalletInfo = {
        publicKeyHex: compressedPublicKey,
        address,
        balance: balance?.total || 0
      };

      return this;
    } catch (_error) {
      throw new Error('Could not connect to Unisat Wallet');
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return 'Unisat';
  };

  getAddress = async (): Promise<string> => {
    this.checkWalletProvider();
    return this.getWalletInfo().address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    return this.getWalletInfo().publicKeyHex;
  };

  signPsbt = async (psbtHex: string, options?: UnisatOptions): Promise<string> => {
    this.checkWalletProvider();
    // Use signPsbt since it shows the fees
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex, options);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    this.checkWalletProvider();
    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    this.checkWalletProvider();
    return await this.bitcoinNetworkProvider.signMessage(message, 'bip322-simple');
  };

  getNetwork = async (): Promise<Network> => {
    // unisat does not provide a way to get the network for Signet and Testnet
    // So we pass the check on connection and return the environment network
    if (!this.networkEnv) {
      throw new Error('Network not set');
    }
    return this.networkEnv;
  };

  on = (eventName: string, callBack: () => void) => {
    this.checkWalletProvider();
    // subscribe to account change event
    if (eventName === 'accountChanged') {
      return this.unisatWallet.on(eventName, callBack);
    }
  };

  // Mempool calls

  getBalance = async (): Promise<number> => {
    return await getAddressBalance(await this.getAddress());
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return await pushTx(txHex);
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };

  disconnect = async (): Promise<void> => {
    await this.unisatWallet.disconnect();
  };

  init = async (): Promise<{
    balance: number;
    address: string;
    pubkey: string;
  }> => {
    const accounts = await this.bitcoinNetworkProvider.getAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    const compressedPublicKey = await this.bitcoinNetworkProvider.getPublicKey();
    const balance = await this.bitcoinNetworkProvider.getBalance();

    this.unisatWalletInfo = {
      publicKeyHex: compressedPublicKey,
      address,
      balance
    };

    return {
      address,
      balance: balance?.total || 0,
      pubkey: compressedPublicKey
    };
  };

  getWalletInfo = (): WalletInfo => {
    if (!this.unisatWalletInfo) {
      this.init();
    }
    return this.unisatWalletInfo!;
  };

  // biome-ignore lint/suspicious/useAwait: used to avoid type errors
  checkWalletProvider = async (): Promise<void> => {
    if (!this.unisatWallet || !window[unisatProvider as keyof typeof window]) {
      throw new Error('Unisat Wallet extension not found');
    }
  };
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}
