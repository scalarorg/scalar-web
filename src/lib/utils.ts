import { TCustodian, TProtocolChain } from "@/types/protocol";
import { type ClassValue, clsx } from "clsx";
import { isHexString } from "ethers";
import { keyBy } from "lodash";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";
import { decodeScalarBytesToUint8Array } from "./scalar";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTokenAmount = (
  amount: bigint,
  decimals = 18,
  precision = 4,
) => {
  const amountStr = formatUnits(amount, decimals);

  const [integerPart, decimalPart] = amountStr.split(".");
  // chunk integer part into groups of 3
  const integerPartChunks = integerPart.match(/.{1,3}/g);
  const integerPartStr = integerPartChunks?.join(",");
  if (decimalPart) {
    return `${integerPartStr}.${decimalPart.slice(0, precision)}`;
  }
  return integerPartStr || "0";
};

export const isBtcChain: (chain?: TProtocolChain | string) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("bitcoin");
  return !!chain.chain?.startsWith("bitcoin");
};

export const isEvmChain: (chain?: TProtocolChain | string) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("evm");
  return !!chain.chain?.startsWith("evm");
};

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

export const getChainID = (chain: TProtocolChain | string | null) => {
  if (!chain) return "";
  if (typeof chain === "string") return chain.split("|")[1];
  return chain.chain?.split("|")[1] || "";
};

export const handleError = (error: unknown) => {
  console.error({ error });
  throw error instanceof Error ? error : new Error("An error occurred");
};

export const handleTokenApproval = async (
  sourceChainAddress: string,
  gatewayAddress: `0x${string}`,
  transferAmount: bigint,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  { checkAllowance, approveERC20 }: any,
) => {
  const currentAllowance = await checkAllowance(
    sourceChainAddress,
    gatewayAddress,
  );

  if (currentAllowance >= transferAmount) {
    return;
  }
  try {
    const approvalTx = await approveERC20(gatewayAddress, transferAmount);
    if (!approvalTx) throw new Error("Failed to create approval transaction");

    const approvalConfirmed = await Promise.race([
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Approval timeout")), 60000),
      ),
      approvalTx.wait(),
    ]);

    if (!approvalConfirmed) {
      throw new Error("Approval failed");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message?.includes("contract runner")) {
        throw new Error(
          "Please ensure your wallet is connected and network is correct",
        );
      }
    }
    throw error;
  }
};

export const prepareCustodianPubkeys = (custodians: TCustodian[]) => {
  if (!custodians) return null;
  const custodian = custodians.filter(
    (custodian) => custodian.status === "STATUS_ACTIVATED",
  );
  return custodian
    .filter((custodian) => !!custodian.bitcoin_pubkey)
    .map((custodian) =>
      decodeScalarBytesToUint8Array(custodian.bitcoin_pubkey!),
    );
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const prepareCustodianPubkeysArray = (custodians: any[]) => {
  const custodianPubkeysBuffer = prepareCustodianPubkeys(custodians);
  if (!custodianPubkeysBuffer) throw new Error("Invalid custodian pubkeys");

  const result: number[] = [];
  for (const curr of custodianPubkeysBuffer) {
    result.push(...curr);
  }

  return new Uint8Array(result);
};

export const validateRequiredFields = (fields: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) throw new Error(`Missing required field: ${key}`);
  }
};

export const validateTransferConfig = (
  sourceTokenAddress?: string,
  gateway?: { address?: string },
) => {
  if (
    !sourceTokenAddress ||
    !gateway?.address ||
    !isHexString(gateway.address)
  ) {
    throw new Error("Invalid configuration");
  }
};
export const BTC_DECIMALS = 8;

export const formatBTC = (sats: bigint | number) => {
  return Number(formatUnits(sats as bigint, BTC_DECIMALS));
};

export const parseSats = (btc: string) => {
  return parseUnits(btc, BTC_DECIMALS);
};

export const VOUT_INDEX_OF_LOCKING_OUTPUT = 1;

export class UtilityList<T extends Record<"label", string>> {
  public readonly LIST: T[];

  constructor(list: T[]) {
    this.LIST = list;
  }

  get OBJECT() {
    return keyBy(this.LIST, "value");
  }
}

const levenshtein = (a: string, b: string) => {
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[j][0] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  return dp[m][n];
};

export const fuzzyMatch = (candidate: string, query: string) => {
  const lowerCandidate = candidate.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerCandidate.includes(lowerQuery)) return true;

  const candidateWords = lowerCandidate.split(/\s+/);
  const queryWords = lowerQuery.split(/\s+/);

  return queryWords.every((qw) =>
    candidateWords.some((cw) => {
      const distance = levenshtein(cw, qw);
      const threshold = Math.max(1, Math.floor(qw.length / 3));
      return distance <= threshold;
    }),
  );
};
