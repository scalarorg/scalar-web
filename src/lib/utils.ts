import { TProtocolChain } from "@/types/protocol";
import { type ClassValue, clsx } from "clsx";
import { isHexString } from "ethers";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";
import { decodeScalarBytesToUint8Array } from "./scalar";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTokenAmount = (amount: bigint, decimals = 8) => {
  return (Number(amount) / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
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

  if (currentAllowance < transferAmount) {
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
  }
};

export const prepareCustodianPubkeys = (
  custodians: {
    name?: string;
    btc_pubkey?: string;
    status: "STATUS_UNSPECIFIED" | "STATUS_ACTIVATED" | "STATUS_DEACTIVATED";
    description?: string;
  }[],
) => {
  if (!custodians) return null;
  const custodian = custodians.filter(
    (custodian) => custodian.status === "STATUS_ACTIVATED",
  );
  return custodian
    .filter((custodian) => !!custodian.btc_pubkey)
    .map((custodian) => decodeScalarBytesToUint8Array(custodian.btc_pubkey!));
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

export const formatBTC = (sats: bigint | number) => {
  return Number(formatUnits(sats as bigint, 8));
};

export const parseSats = (btc: string) => {
  return parseUnits(btc, 8);
};
