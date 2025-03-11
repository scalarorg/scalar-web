import { TBadgeVariants } from "@/components/ui/badge";
import { UtilityList } from "@/lib/utils";
import { EProtocolStatus } from "./models";

export const LIQUIDITY_MODEL = new UtilityList([
  { label: "Pool", value: "LIQUIDITY_MODEL_POOL" },
  { label: "UPC", value: "LIQUIDITY_MODEL_UPC" },
]);

export const MAX_FILE_SIZE = 1; // MB

export const PROTOCOL_STATUS = new UtilityList<{
  label: string;
  value: EProtocolStatus;
  className?: string;
  variant?: TBadgeVariants["variant"];
}>([
  {
    label: "Unspecified",
    value: EProtocolStatus.UNSPECIFIED,
    variant: "default",
  },
  {
    label: "Activated",
    value: EProtocolStatus.ACTIVATED,
    variant: "success",
  },
  {
    label: "Deactivated",
    value: EProtocolStatus.DEACTIVATED,
    variant: "fail",
  },
  {
    label: "Pending",
    value: EProtocolStatus.PENDING,
    variant: "pending",
  },
]);
