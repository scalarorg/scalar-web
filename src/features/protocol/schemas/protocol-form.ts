import { ELiquidityModel } from "@/enums";
import { z } from "zod";

const message = {
  name: "Please enter the protocol name",
  token: "Please enter the token name",
  icon: "Please upload the protocol icon",
  type: "Please select the type",
};
export const protocolFormSchema = z.object({
  name: z
    .string({
      required_error: message.name,
    })
    .min(1, { message: message.name }),
  token: z
    .string({
      required_error: message.token,
    })
    .min(1, { message: message.token }),
  icon: z
    .string({
      required_error: message.icon,
    })
    .min(1, { message: message.icon }),
  type: z.enum([ELiquidityModel.POOL, ELiquidityModel.UPC], {
    required_error: message.type,
  }),
});

export type TProtocolForm = z.infer<typeof protocolFormSchema>;
