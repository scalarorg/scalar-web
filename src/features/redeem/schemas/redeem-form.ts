import { z } from 'zod';

export const redeemFormSchema = z.object({
  transferAmount: z.coerce
    .number({
      required_error: 'Please enter the amount.'
    })
    .positive('Must be a number'),
  sourceChain: z.string({ required_error: 'Please choose one chain' }).min(1, {
    message: 'Please choose one chain'
  }),
  destRecipientAddress: z
    .string({
      required_error: 'Please enter your token receiver address.'
    })
    .min(1, {
      message: 'Please enter your token receiver address.'
    })
});

export type TRedeemForm = z.infer<typeof redeemFormSchema>;
