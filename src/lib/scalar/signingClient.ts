import { type GeneratedType, type OfflineSigner, Registry } from '@cosmjs/proto-signing';

import { fromBech32 } from '@cosmjs/encoding';

import Long from 'long';

import {
  type DeliverTxResponse,
  type SignerData,
  SigningStargateClient,
  type SigningStargateClientOptions,
  type StargateClientOptions,
  type StdFee,
  defaultRegistryTypes
} from '@cosmjs/stargate';

import { type HttpEndpoint, Tendermint37Client } from '@cosmjs/tendermint-rpc';

import {
  type CosmosEncodeObject,
  type ScalarEncodeObject,
  type ScalarMsgClient,
  createMsgClient
} from '@scalar-lab/scalarjs-sdk/stargate/messages';

import { type ScalarQueryClient, createQueryClient } from '@scalar-lab/scalarjs-sdk/stargate/queryClient';

import { CreateProtocolRequest } from '@scalar-lab/scalarjs-sdk/proto/scalar/protocol/v1beta1/tx';

import { STANDARD_GAS_PRICE } from './constants';

import { LiquidityModel } from '@scalar-lab/scalarjs-sdk/proto/scalar/protocol/exported/v1beta1/types';
import type { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { isSecp256k1Pubkey } from '../utils';
import type {
  CreateDeployTokenEncodeObject,
  CreateProtocolEncodeObject,
  ReserveRedeemUtxoEncodeObject
} from './interface';

import { CreateDeployTokenRequest } from '@scalar-lab/scalarjs-sdk/proto/scalar/chains/v1beta1/tx';
import { ReserveRedeemUtxoRequest } from '@scalar-lab/scalarjs-sdk/proto/scalar/covenant/v1beta1/tx';
import { isHexString } from 'ethers';
import {
  typeUrlCreateDeployTokenRequest,
  typeUrlCreateProtocolRequest,
  typeUrlReserveRedeemUtxoRequest
} from './interface';
import {
  CreateDeployTokenParams,
  CreateProtocolParams,
  LiquidityModelParams,
  ReserveRedeemUtxoParams
} from './params';
import {
  validateCreateDeployTokenParams,
  validateProtocolParams,
  validateReserveRedeemUtxoParams
} from './validation';

export const scalarTypes: ReadonlyArray<[string, GeneratedType]> = [
  [typeUrlCreateProtocolRequest, CreateProtocolRequest],
  [typeUrlCreateDeployTokenRequest, CreateDeployTokenRequest],
  [typeUrlReserveRedeemUtxoRequest, ReserveRedeemUtxoRequest]
];

export const scalarDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ...scalarTypes
];

function createDefaultRegistry(): Registry {
  return new Registry(scalarDefaultRegistryTypes);
}

export type ScalarSigningClientMessage = ScalarEncodeObject | CosmosEncodeObject;

export class ScalarSigningStargateClient extends SigningStargateClient {
  public readonly tx: ScalarMsgClient | undefined;
  public readonly messages: ScalarMsgClient;
  public readonly query: ScalarQueryClient | undefined;

  protected constructor(
    tmClient: Tendermint37Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions
  ) {
    super(tmClient, signer, {
      registry: createDefaultRegistry(),
      gasPrice: STANDARD_GAS_PRICE,
      ...options
    });

    this.tx = createMsgClient(this);
    this.messages = this.tx;

    if (tmClient) {
      //
      this.query = createQueryClient(tmClient as any) as any;
    } else {
      this.query = undefined;
    }
  }

  static override async connect(endpoint: string | HttpEndpoint, options: StargateClientOptions = {}) {
    const tmClient = await Tendermint37Client.connect(endpoint);
    return new ScalarSigningStargateClient(tmClient, {} as OfflineSigner, options);
  }

  public static async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {}
  ): Promise<ScalarSigningStargateClient> {
    const tmClient = await Tendermint37Client.connect(endpoint);
    return new ScalarSigningStargateClient(tmClient, signer, options);
  }

  static override offline(signer: OfflineSigner, options: SigningStargateClientOptions = {}) {
    return Promise.resolve(new ScalarSigningStargateClient(undefined, signer, options));
  }

  override simulate(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    memo: string | undefined
  ) {
    return super.simulate(signerAddress, messages, memo);
  }

  override sign(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData
  ): Promise<TxRaw> {
    return super.sign(signerAddress, messages, fee, memo, explicitSignerData);
  }

  override signAndBroadcast(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    fee: number | StdFee | 'auto',
    memo?: string
  ) {
    return super.signAndBroadcast(signerAddress, messages, fee, memo);
  }

  protected override getQueryClient() {
    return this.query;
  }

  protected override forceGetQueryClient() {
    if (this.query === undefined) {
      throw new Error('Query client not available. You cannot use online functionality in offline mode.');
    }

    return this.query;
  }

  public createProtocol(
    creator: string,
    params: CreateProtocolParams,
    fee: StdFee | 'auto' | number,
    memo = ''
  ): Promise<DeliverTxResponse> {
    validateProtocolParams(params);

    if (!isSecp256k1Pubkey(params.bitcoin_pubkey!)) {
      throw 'Invalid bitcoin pubkey';
    }

    const createMsg: CreateProtocolEncodeObject = {
      typeUrl: typeUrlCreateProtocolRequest,
      value: {
        sender: fromBech32(creator).data,
        bitcoinPubkey: Uint8Array.from(Buffer.from(params.bitcoin_pubkey!.replace('0x', ''), 'hex')),
        name: params.name!,
        tag: params.tag!,
        attributes: {
          model: mapLiquidityModel(params.attributes?.model)
        },
        custodianGroupUid: Buffer.from(params.custodian_group_uid!, 'hex'),
        asset: {
          symbol: params?.asset?.symbol!,
          chain: params?.asset?.chain!
        },
        avatar: Uint8Array.from(Buffer.from(params.avatar!, 'base64')),
        tokenName: params.token_name ?? '',
        tokenDecimals: params.token_decimals!,
        tokenCapacity: params.token_capacity!,
        tokenDailyMintLimit: params.token_daily_mint_limit ?? '0'
      }
    };

    return this.signAndBroadcast(creator, [createMsg], fee, memo);
  }

  public createDeployToken(
    creator: string,
    params: CreateDeployTokenParams,
    fee: StdFee | 'auto' | number,
    memo = ''
  ): Promise<DeliverTxResponse> {
    validateCreateDeployTokenParams(params);
    if (params.address && !isHexString(params.address)) {
      throw 'Invalid params.address';
    }

    const createMsg: CreateDeployTokenEncodeObject = {
      typeUrl: typeUrlCreateDeployTokenRequest,
      value: {
        sender: fromBech32(creator).data,
        chain: params?.chain!,
        tokenSymbol: params?.token_symbol!,
        aliasedTokenName: params.aliased_token_name ?? '',
        address: Buffer.from([])
      }
    };

    return this.signAndBroadcast(creator, [createMsg], fee, memo);
  }

  public async reserveRedeemUtxo(
    creator: string,
    params: ReserveRedeemUtxoParams,
    fee: StdFee | 'auto' | number,
    memo = ''
  ): Promise<DeliverTxResponse> {
    validateReserveRedeemUtxoParams(params);
    if (!isHexString(params.address)) {
      throw 'Invalid params.address';
    }
    const msg: ReserveRedeemUtxoEncodeObject = {
      typeUrl: typeUrlReserveRedeemUtxoRequest,
      value: {
        sender: fromBech32(creator).data,
        address: params.address,
        sourceChain: params.source_chain!,
        destChain: params.dest_chain!,
        symbol: params.symbol!,
        amount: Long.fromString(params.amount!),
        lockingScript: Buffer.from(params.locking_script!, 'hex')
      }
    };

    return this.signAndBroadcast(creator, [msg], fee, memo);
  }
}

const mapLiquidityModel = (model: LiquidityModelParams): LiquidityModel => {
  switch (model) {
    case 'LIQUIDITY_MODEL_POOL':
      return LiquidityModel.LIQUIDITY_MODEL_POOL;
    case 'LIQUIDITY_MODEL_UPC':
      return LiquidityModel.LIQUIDITY_MODEL_UPC;
    default:
      throw 'Invalid liquidity model';
  }
};
