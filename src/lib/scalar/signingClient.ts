import { type GeneratedType, type OfflineSigner, Registry } from "@cosmjs/proto-signing";

import { fromBech32 } from "@cosmjs/encoding";

import {
  type DeliverTxResponse,
  type SignerData,
  SigningStargateClient,
  type SigningStargateClientOptions,
  type StargateClientOptions,
  type StdFee,
  defaultRegistryTypes,
} from "@cosmjs/stargate";

import { type HttpEndpoint, Tendermint37Client } from "@cosmjs/tendermint-rpc";

import {
  type CosmosEncodeObject,
  type ScalarEncodeObject,
  type ScalarMsgClient,
  createMsgClient,
} from "@scalarorg/scalarjs-sdk/stargate/messages";

import { createQueryClient, type ScalarQueryClient } from "@scalarorg/scalarjs-sdk/stargate/queryClient";

import { CreateProtocolRequest } from "@scalarorg/scalarjs-sdk/proto/scalar/protocol/v1beta1/tx";

import { STANDARD_GAS_PRICE } from "./constants";

import { LiquidityModel } from "@scalarorg/scalarjs-sdk/proto/scalar/protocol/exported/v1beta1/types";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { isSecp256k1Pubkey } from "../utils";
import type { CreateProtocolEncodeObject, CreateProtocolParams, LiquidityModelParams } from "./interface";

import { typeUrlCreateProtocolRequest } from "./interface";

export const scalarTypes: ReadonlyArray<[string, GeneratedType]> = [
  [typeUrlCreateProtocolRequest, CreateProtocolRequest],
];

export const scalarDefaultRegistryTypes: ReadonlyArray<
  [string, GeneratedType]
> = [...defaultRegistryTypes, ...scalarTypes];

function createDefaultRegistry(): Registry {
  return new Registry(scalarDefaultRegistryTypes);
}

export type ScalarSigningClientMessage =
  | ScalarEncodeObject
  | CosmosEncodeObject;

export class ScalarSigningStargateClient extends SigningStargateClient {
  public readonly tx: ScalarMsgClient | undefined;
  public readonly messages: ScalarMsgClient;
  public readonly query: ScalarQueryClient | undefined;

  protected constructor(
    tmClient: Tendermint37Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient, signer, {
      registry: createDefaultRegistry(),
      gasPrice: STANDARD_GAS_PRICE,
      ...options,
    });

    this.tx = createMsgClient(this);
    this.messages = this.tx;

    this.query =
      tmClient !== undefined ? createQueryClient(tmClient) : undefined;
  }

  static override async connect(
    endpoint: string | HttpEndpoint,
    options: StargateClientOptions = {},
  ) {
    const tmClient = await Tendermint37Client.connect(endpoint);
    return new ScalarSigningStargateClient(
      tmClient,
      {} as OfflineSigner,
      options,
    );
  }

  public static async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<ScalarSigningStargateClient> {
    const tmClient = await Tendermint37Client.connect(endpoint);
    return new ScalarSigningStargateClient(tmClient, signer, options);
  }

  static override offline(
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ) {
    return Promise.resolve(
      new ScalarSigningStargateClient(undefined, signer, options),
    );
  }

  override simulate(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    memo: string | undefined,
  ) {
    return super.simulate(signerAddress, messages, memo);
  }

  override sign(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData,
  ): Promise<TxRaw> {
    return super.sign(signerAddress, messages, fee, memo, explicitSignerData);
  }

  override signAndBroadcast(
    signerAddress: string,
    messages: readonly ScalarSigningClientMessage[],
    fee: number | StdFee | "auto",
    memo?: string,
  ) {
    return super.signAndBroadcast(signerAddress, messages, fee, memo);
  }

  protected override getQueryClient() {
    return this.query;
  }

  protected override forceGetQueryClient() {
    if (this.query === undefined) {
      throw new Error(
        "Query client not available. You cannot use online functionality in offline mode.",
      );
    }

    return this.query;
  }

  public createProtocol(
    creator: string,
    params: CreateProtocolParams,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    if (!params.bitcoin_pubkey) {
      throw "Empty bitcoin pubkey"
    }

    if (!isSecp256k1Pubkey(params.bitcoin_pubkey)) {
      throw "Invalid bitcoin pubkey"
    }

    if (!params.name) {
      throw "Empty name"
    }

    if (!params.tag) {
      throw "Empty tag"
    }

    if (!params.custodian_group_uid) {
      throw "Empty custodian group uid"
    }

    if (!params.avatar) {
      throw "Empty avatar"
    }

    if (!params.asset || !params.asset.chain || !params.asset.name) {
      throw "Invalid asset"
    }

    const createMsg: CreateProtocolEncodeObject = {
      typeUrl: typeUrlCreateProtocolRequest,
      value: CreateProtocolRequest.fromPartial({
        sender: fromBech32(creator).data,
        bitcoinPubkey: Uint8Array.from(Buffer.from(params.bitcoin_pubkey.replace("0x", ""), "hex")),
        name: params.name,
        tag: params.tag,
        attributes: {
          model: LiquidityModel.LIQUIDITY_MODEL_POOL
        },
        custodianGroupUid: params.custodian_group_uid,
        asset: {
          name: params.asset.name,
          chain: params.asset.chain
        },
        avatar: Uint8Array.from(Buffer.from(params.avatar, "base64"))
      }),
    }

    console.log({ createMsg })

    return this.signAndBroadcast(creator, [createMsg], fee, memo)
  }
}

const mapLiquidityModel = (model: LiquidityModelParams): LiquidityModel => {
  switch (model) {
    case "LIQUIDITY_MODEL_POOL":
      return LiquidityModel.LIQUIDITY_MODEL_POOL
    case "LIQUIDITY_MODEL_UPC":
      return LiquidityModel.LIQUIDITY_MODEL_UPC
    default:
      throw "Invalid liquidity model"
  }
}
