import { ELiquidityModel, EProtocolStatus } from "@/enums";
import { UtilityList } from "@/lib/utils";

export const LIQUIDITY_MODEL = new UtilityList([
  { label: "Pool", value: ELiquidityModel.POOL },
  { label: "UPC", value: ELiquidityModel.UPC },
]);

export const MAX_FILE_SIZE = 90; // KB

export const PROTOCOL_STATUS = new UtilityList([
  {
    label: "Unspecified",
    value: EProtocolStatus.UNSPECIFIED,
    className: "bg-blue-500",
  },
  {
    label: "Activated",
    value: EProtocolStatus.ACTIVATED,
    className: "bg-green-500",
  },
  {
    label: "Deactivated",
    value: EProtocolStatus.DEACTIVATED,
    className: "bg-red-500",
  },
  {
    label: "Pending",
    value: EProtocolStatus.PENDING,
    className: "bg-yellow-500",
  },
]);
