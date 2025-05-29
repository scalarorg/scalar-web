import { isSecp256k1Pubkey } from '@/lib/utils';
import { z } from 'zod';

const message = {
  name: 'Please enter the protocol name',
  token_name: 'Please enter the token name',
  avatar: 'Please upload the protocol icon',
  model: 'Please select the type',
  custodian_group_uid: 'Please select the custodian group',
  chain_name: 'Please select the chain',
  tag: 'Please select the tag',
  bitcoin_pubkey: 'Please enter the bitcoin pubkey',
  symbol: 'Please enter the symbol',
  decimals: 'Please enter the decimals',
  chain: 'Please select the chain',
  alias: 'Please enter the alias'
};
export const protocolFormSchema = z.object({
  name: z
    .string({
      required_error: message.name
    })
    .min(1, { message: message.name }),
  token_name: z
    .string({
      required_error: message.token_name
    })
    .min(1, { message: message.token_name }),
  avatar: z
    .string({
      required_error: message.avatar
    })
    .min(1, { message: message.avatar }),
  model: z.enum(['LIQUIDITY_MODEL_POOL', 'LIQUIDITY_MODEL_UPC'], {
    required_error: message.model
  }),
  custodian_group_uid: z
    .string({
      required_error: message.custodian_group_uid
    })
    .min(1, { message: message.custodian_group_uid }),
  chain_name: z
    .string({
      required_error: message.chain_name
    })
    .min(1, { message: message.chain_name }),
  tag: z
    .string({
      required_error: message.tag
    })
    .min(1, { message: message.tag }),
  bitcoin_pubkey: z
    .string({
      required_error: message.bitcoin_pubkey
    })
    .min(1, { message: message.bitcoin_pubkey })
    .refine((data) => isSecp256k1Pubkey(data), {
      message: 'Invalid bitcoin pubkey'
    }),
  token_decimals: z
    .number({
      required_error: message.decimals
    })
    .int('Decimals must be an integer')
    .min(1, 'Decimals must be at least 1')
    .max(256, 'Decimals must be at most 256'),
  symbol: z
    .string({
      required_error: message.symbol
    })
    .min(1, { message: message.symbol }),
  token_daily_mint_limit: z
    .string()
    .regex(/^\d+$/, 'Daily mint limit must be a valid number')
    .refine((val) => BigInt(val) >= 0, {
      message: 'Daily mint limit must be at least 0'
    }),
  token_capacity: z
    .string()
    .regex(/^\d+$/, 'Capacity must be a valid number')
    .refine((val) => BigInt(val) >= 0, {
      message: 'Capacity must be at least 0'
    })
});

export type TProtocolForm = z.infer<typeof protocolFormSchema>;

export const networkFormSchema = z.object({
  chain: z
    .string({
      required_error: message.chain
    })
    .min(1, { message: message.chain }),
  alias: z
    .string({
      required_error: message.alias
    })
    .min(1, { message: message.alias })
});

export type TNetworkForm = z.infer<typeof networkFormSchema>;
