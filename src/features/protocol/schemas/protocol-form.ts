import { isSecp256k1Pubkey } from "@/lib/utils";
import { z } from "zod";

const message = {
  name: "Please enter the protocol name",
  asset_name: "Please enter the token name",
  avatar: "Please upload the protocol icon",
  model: "Please select the type",
  custodian_group_uid: "Please select the custodian group",
  chain_name: "Please select the chain",
  tag: "Please select the tag",
  bitcoin_pubkey: "Please enter the bitcoin pubkey",
};
export const protocolFormSchema = z.object({
  name: z
    .string({
      required_error: message.name,
    })
    .min(1, { message: message.name }),
  asset_name: z
    .string({
      required_error: message.asset_name,
    })
    .min(1, { message: message.asset_name }),
  avatar: z
    .string({
      required_error: message.avatar,
    })
    .min(1, { message: message.avatar }),
  model: z.enum(["LIQUIDITY_MODEL_POOL", "LIQUIDITY_MODEL_UPC"], {
    required_error: message.model,
  }),
  custodian_group_uid: z
    .string({
      required_error: message.custodian_group_uid,
    })
    .min(1, { message: message.custodian_group_uid }),
  chain_name: z
    .string({
      required_error: message.chain_name,
    })
    .min(1, { message: message.chain_name }),
  tag: z
    .string({
      required_error: message.tag,
    })
    .min(1, { message: message.tag }),
  bitcoin_pubkey: z
    .string({
      required_error: message.bitcoin_pubkey,
    })
    .min(1, { message: message.bitcoin_pubkey })
    .refine((data) => isSecp256k1Pubkey(data), {
      message: "Invalid bitcoin pubkey",
    }),
});

export type TProtocolForm = z.infer<typeof protocolFormSchema>;
