import { z } from "zod";

export const bridgeFormSchema = z.object({
  // sourceChain: z.string({
  //   required_error: "Please select a source chain.",
  // }),
  // sourceChainAddress: z.string({
  //   required_error: "Please enter your source chain address.",
  // }),
  // destinationChain: z.string({
  //   required_error: "Please select a destination chain.",
  // }),
  destRecipientAddress: z.string({
    required_error: "Please enter your token receiver address.",
  }),
  transferAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive("Must be a number"),
  // btcFeeRate: z
  //   .enum([
  //     "fastestFee",
  //     "halfHourFee",
  //     "hourFee",
  //     "economyFee",
  //     "minimumFee",
  //     "customFee",
  //   ])
  //   .default("minimumFee"),
  // customFeeRate: z.coerce
  //   .number()
  //   .int("Please enter a whole number.")
  //   .positive("Please enter a positive number.")
  //   .optional(),
  destinationChain: z.string({
    required_error: "Please choose one token",
  }),
});

export type TBridgeForm = z.infer<typeof bridgeFormSchema>;
