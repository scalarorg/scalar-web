import { z } from "zod";

const message = {
  address: "Please enter the address",
};

export const faucetFormSchema = z.object({
  address: z
    .string({
      required_error: message.address,
    })
    .min(1, { message: message.address }),
});

export type TFaucetForm = z.infer<typeof faucetFormSchema>;
