import { z } from 'zod';

export const transfersFormSchema = z.object({
  transferAmount: z.coerce
    .number({
      required_error: 'Please enter the amount.'
    })
    .positive('Must be a number'),
  destRecipientAddress: z
    .string({
      required_error: 'Please enter your token receiver address.'
    })
    .min(1, {
      message: 'Please enter your token receiver address.'
    }),
  token: z
    .string({
      required_error: 'Please choose one token'
    })
    .min(1, { message: 'Please choose one token' }),
  sourceChain: z.string({ required_error: 'Please choose one chain' }).min(1, {
    message: 'Please choose one chain'
  }),
  destinationChain: z.string({ required_error: 'Please choose one chain' }).min(1, {
    message: 'Please choose one chain'
  })
});

export type TTransfersForm = z.infer<typeof transfersFormSchema>;
