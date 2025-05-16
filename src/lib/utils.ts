import { ChainTypes } from "@/types/chains";
import { TCustodian, TProtocolChain } from "@/types/types";
import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { MaxUint256, isHexString } from "ethers";
import { keyBy } from "lodash";
import numeral from "numeral";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";
import { decodeScalarBytesToUint8Array } from "./scalar";

dayjs.extend(utc);
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
  const integerPartChunks = integerPart
    .split("")
    .reverse()
    .join("")
    .match(/.{1,3}/g)
    ?.map((chunk) => chunk.split("").reverse().join(""))
    .reverse();
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
  if (typeof chain === "string") return !!chain.startsWith(ChainTypes.Bitcoin);
  return !!chain.chain?.startsWith(ChainTypes.Bitcoin);
};

export const isEvmChain: (chain?: TProtocolChain | string) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith(ChainTypes.EVM);
  return !!chain.chain?.startsWith(ChainTypes.EVM);
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  args: {
    owner: string;
    gatewayAddress: `0x${string}`;
    transferAmount: bigint;
    checkAllowance: (
      ownerAddress: string,
      spenderAddress: string,
    ) => Promise<any> | undefined;
    approveERC20: (
      spenderAddress: string,
      burnAmount: bigint,
    ) => Promise<any> | undefined;
  },
) => {
  const {
    owner,
    gatewayAddress,
    transferAmount,
    checkAllowance,
    approveERC20,
  } = args;

  const currentAllowance = await checkAllowance(owner, gatewayAddress);

  // console.log({
  //   currentAllowance,
  //   transferAmount,
  //   owner,
  //   gatewayAddress,
  // });

  if (currentAllowance >= transferAmount) {
    return;
  }
  try {
    const approvalTx = await approveERC20(gatewayAddress, MaxUint256);
    if (!approvalTx) throw new Error("Failed to create approval transaction");

    const approvalConfirmed = await Promise.race([
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Approval timeout")), 500_000),
      ),
      approvalTx.wait(),
    ]);

    if (!approvalConfirmed) {
      throw new Error("Approval failed");
    }

    const currentAllowance = await checkAllowance(owner, gatewayAddress);

    if (currentAllowance < transferAmount) {
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

const PUBKEY_LENGTH = 33;

export const isSecp256k1Pubkey = (pubkey: string) => {
  if (pubkey.startsWith("0x")) {
    return isHexString(pubkey, PUBKEY_LENGTH);
  }
  return isHexString(`0x${pubkey}`, PUBKEY_LENGTH);
};

export const extractBase64Data = (base64String: string) => {
  return base64String.replace(/^data:image\/\w+;base64,/, "");
};

export const addBase64Prefix = (base64Data: string, mimeType = "image/png") => {
  return `data:${mimeType};base64,${base64Data}`;
};

type KeplrError = {
  code: string;
  desc: string;
  detail: string | KeplrError[];
  gasWanted: number;
  gasUsed: number;
};

const parseNestedErrors = (detailString: string): KeplrError[] | string => {
  const nestedErrors: KeplrError[] = [];
  const errorPattern = /rpc error: code = (\w+) desc = (.+?)(?=rpc error|$)/gs;

  let match: RegExpExecArray | null = errorPattern.exec(detailString);
  while (match !== null) {
    nestedErrors.push({
      code: match[1],
      desc: match[2].trim(),
      detail: "Parsed recursively",
      gasWanted: 0,
      gasUsed: 0,
    });

    match = errorPattern.exec(detailString);
  }

  return nestedErrors.length > 0 ? nestedErrors : detailString;
};

export const parseKeplrError = (errorString: string): KeplrError | null => {
  const codeMatch = errorString.match(/code\s*=\s*(\w+)/);
  const descMatch = errorString.match(/desc\s*=\s*([^:]+)/);
  const detailedMatch = errorString.match(
    /message index: \d+: (.+?) With gas wanted:/,
  );
  const gasWantedMatch = errorString.match(/gas wanted: '(\d+)'/);
  const gasUsedMatch = errorString.match(/gas used: '(\d+)'/);

  if (
    !codeMatch ||
    !descMatch ||
    !detailedMatch ||
    !gasWantedMatch ||
    !gasUsedMatch
  ) {
    return null;
  }

  return {
    code: codeMatch[1],
    desc: descMatch[1].trim(),
    detail: parseNestedErrors(detailedMatch[1].trim()),
    gasWanted: Number.parseInt(gasWantedMatch[1], 10),
    gasUsed: Number.parseInt(gasUsedMatch[1], 10),
  };
};

export const shortenText = (input: string, visibleChars = 3): string => {
  if (input.length <= visibleChars * 2) return input;
  return `${input.slice(0, visibleChars)}...${input.slice(-visibleChars)}`;
};

export const formatNumber = (number: number, formater = "0[.][00]a") => {
  return numeral(number).format(formater);
};

export const formatDate = (date: number, formater = "DD/MM/YYYY") => {
  const newDate = new Date(date * 1000);
  return dayjs(newDate).format(formater);
};
export const friendlyFormatDate = (date: number) => {
  const inputDate = dayjs(date * 1000);
  const currentDate = dayjs().utc();
  //const currentDate = dayjs();
  const diffInMonths = currentDate.diff(inputDate, "month");
  if (diffInMonths > 1) {
    return `${diffInMonths} months ago`;
  }
  if (diffInMonths === 1) {
    return "a month ago";
  }
  const diffInDays = currentDate.diff(inputDate, "day");
  if (diffInDays > 1) {
    return `${diffInDays} days ago`;
  }
  if (diffInDays === 1) {
    return "a day ago";
  }
  const diffInHours = currentDate.diff(inputDate, "hour");
  if (diffInHours > 1) {
    return `${diffInHours} hours ago`;
  }
  if (diffInHours === 1) {
    return "an hour ago";
  }
  const diffInMinutes = currentDate.diff(inputDate, "minute");
  if (diffInMinutes > 1) {
    return `${diffInMinutes} minutes ago`;
  }
  if (diffInMinutes === 1) {
    return "a minute ago";
  }
  const diffInSeconds = currentDate.diff(inputDate, "second");
  if (diffInSeconds > 1) {
    return `${diffInSeconds} seconds ago`;
  }
  if (diffInSeconds === 1) {
    return "a second ago";
  }
  return "just now";
};
export const handle0xString = (str: string) => ({
  remove: str.replace("0x", ""),
  add: str.startsWith("0x") ? str : `0x${str}`,
});
