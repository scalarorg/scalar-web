import { getNetworkConfig } from '@/config/nework.config';
import { Fees, Network, UTXO } from '@/lib/wallet';
import { MempoolUTXO } from '@/types/btc';

const { mempoolApiUrl } = getNetworkConfig();

/*
    URL Construction methods
*/
// The base URL for the signet API
// Utilises an environment variable specifying the mempool API we intend to
// utilise
const mempoolAPI = `${mempoolApiUrl}/api/`;

// URL for the address info endpoint
function addressInfoUrl(address: string): URL {
  return new URL(`${mempoolAPI}address/${address}`);
}

// URL for the push transaction endpoint
function pushTxUrl(): URL {
  return new URL(`${mempoolAPI}tx`);
}

// URL for retrieving information about an address' UTXOs
function utxosInfoUrl(address: string): URL {
  return new URL(`${mempoolAPI}address/${address}/utxo`);
}

// URL for retrieving information about the recommended network fees
function networkFeesUrl(): URL {
  return new URL(`${mempoolAPI}v1/fees/recommended`);
}

// URL for retrieving the tip height of the BTC chain
function btcTipHeightUrl(): URL {
  return new URL(`${mempoolAPI}blocks/tip/height`);
}

// URL for validating an address which contains a set of information about the address
// including the scriptPubKey
function validateAddressUrl(address: string): URL {
  return new URL(`${mempoolAPI}v1/validate-address/${address}`);
}

// URL for the transaction info endpoint
function txInfoUrl(txId: string): URL {
  return new URL(`${mempoolAPI}tx/${txId}`);
}

export function mempoolWebTxUrl(txId: string, network = Network.TESTNET): URL {
  const mempool_web_url = import.meta.env.VITE_MEMPOOL_API;
  const tx_preview_prefix = network === Network.MAINNET || network === Network.REGTEST ? '' : 'testnet/';
  return new URL(`${mempool_web_url}/${tx_preview_prefix}tx/${txId}`);
}

/**
 * Pushes a transaction to the Bitcoin network.
 * @param txHex - The hex string corresponding to the full transaction.
 * @returns A promise that resolves to the response message.
 */
export async function pushTx(txHex: string): Promise<string> {
  const response = await fetch(pushTxUrl(), {
    method: 'POST',
    body: txHex
  });
  if (!response.ok) {
    try {
      const mempoolError = await response.text();
      // Extract the error message from the response
      const message = mempoolError?.split('"message":"')[1]?.split('"}')[0];
      if (mempoolError.includes('error') || mempoolError.includes('message')) {
        throw new Error(message);
      }
      throw new Error('Error broadcasting transaction. Please try again');
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  } else {
    return await response.text();
  }
}

/**
 * Returns the balance of an address.
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves to the amount of satoshis that the address
 *          holds.
 */
export async function getAddressBalance(address: string): Promise<number> {
  const response = await fetch(addressInfoUrl(address));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  const addressInfo = await response.json();
  return addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum;
}

/**
 * Retrieve the recommended Bitcoin network fees.
 * @returns A promise that resolves into a `Fees` object.
 */
export async function getNetworkFees(): Promise<Fees> {
  const response = await fetch(networkFeesUrl());
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
}
// Get the tip height of the BTC chain
export async function getTipHeight(): Promise<number> {
  const response = await fetch(btcTipHeightUrl());
  const result = await response.text();
  if (!response.ok) {
    throw new Error(result);
  }
  const height = Number(result);
  if (Number.isNaN(height)) {
    throw new Error('Invalid result returned');
  }
  return height;
}

/**
 * Retrieve a set of UTXOs that are available to an address
 * and satisfy the `amount` requirement if provided. Otherwise, fetch all UTXOs.
 * The UTXOs are chosen based on descending amount order.
 * @param address - The Bitcoin address in string format.
 * @param amount - The amount we expect the resulting UTXOs to satisfy.
 * @returns A promise that resolves into a list of UTXOs.
 */
export async function getFundingUTXOs(
  address: string,
  amount?: number,
  nominatedUTXOs?: MempoolUTXO[]
): Promise<UTXO[]> {
  // Get all UTXOs for the given address

  let utxos: MempoolUTXO[] = [];
  try {
    if (nominatedUTXOs) {
      utxos = nominatedUTXOs;
    } else {
      const response = await fetch(utxosInfoUrl(address));
      utxos = await response.json();
    }
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(errorMessage);
  }

  // Remove unconfirmed UTXOs as they are not yet available for spending
  // and sort them in descending order according to their value.
  // We want them in descending order, as we prefer to find the least number
  // of inputs that will satisfy the `amount` requirement,
  // as less inputs lead to a smaller transaction and therefore smaller fees.
  const confirmedUTXOs = utxos.filter((utxo) => utxo?.status?.confirmed).sort((a, b) => b.value - a.value);

  // If amount is provided, reduce the list of UTXOs into a list that
  // contains just enough UTXOs to satisfy the `amount` requirement.
  let sliced = confirmedUTXOs;
  if (amount) {
    let sum = 0;
    let i = 0;
    for (; i < confirmedUTXOs.length; ++i) {
      const utxo = confirmedUTXOs[i];
      if (!utxo?.value) {
        continue;
      }

      sum += utxo.value;

      if (sum > amount) {
        break;
      }
    }
    if (sum < amount) {
      return [];
    }
    sliced = confirmedUTXOs.slice(0, i + 1);
  }

  const response = await fetch(validateAddressUrl(address));
  const addressInfo = await response.json();
  const { isvalid, scriptPubKey } = addressInfo;
  if (!isvalid) {
    throw new Error('Invalid address');
  }

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  return sliced.map((s) => {
    return {
      txid: s.txid,
      vout: s.vout,
      value: s.value,
      scriptPubKey: scriptPubKey
    };
  });
}

/**
 * Retrieve information about a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the transaction information.
 */
export async function getTxInfo(txId: string): Promise<unknown> {
  const response = await fetch(txInfoUrl(txId));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
}
