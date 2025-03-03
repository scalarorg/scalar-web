import { UtilityList } from "@/lib/utils";

export const LIQUIDITY_MODEL = new UtilityList([
  { label: "Pool", value: "LIQUIDITY_MODEL_POOL" },
  { label: "UPC", value: "LIQUIDITY_MODEL_UPC" },
]);

export const MAX_FILE_SIZE = 1; // MB

export const PROTOCOL_STATUS = new UtilityList([
  {
    label: "Unspecified",
    value: "STATUS_UNSPECIFIED",
    className: "bg-blue-500",
  },
  {
    label: "Activated",
    value: "STATUS_ACTIVATED",
    className: "bg-green-500",
  },
  {
    label: "Deactivated",
    value: "STATUS_DEACTIVATED",
    className: "bg-red-500",
  },
  {
    label: "Pending",
    value: "STATUS_PENDING",
    className: "bg-yellow-500",
  },
]);
