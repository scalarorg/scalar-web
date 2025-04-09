import type { EncodeObject } from "@cosmjs/proto-signing";
import { CreateDeployTokenRequest } from "@scalar-lab/scalarjs-sdk/proto/scalar/chains/v1beta1/tx";
import type { CreateProtocolRequest } from "@scalar-lab/scalarjs-sdk/proto/scalar/protocol/v1beta1/tx";
import type { ReserveRedeemUtxoRequest } from "@scalar-lab/scalarjs-sdk/proto/scalar/covenant/v1beta1/tx";

export const typeUrlCreateProtocolRequest =
  "/scalar.protocol.v1beta1.CreateProtocolRequest";

export const typeUrlCreateDeployTokenRequest =
  "/scalar.chains.v1beta1.CreateDeployTokenRequest";

export const typeUrlReserveRedeemUtxoRequest =
  "/scalar.covenant.v1beta1.ReserveRedeemUtxoRequest";

export interface CreateProtocolEncodeObject extends EncodeObject {
  readonly typeUrl: typeof typeUrlCreateProtocolRequest;
  readonly value: CreateProtocolRequest;
}

export interface CreateDeployTokenEncodeObject extends EncodeObject {
  readonly typeUrl: typeof typeUrlCreateDeployTokenRequest;
  readonly value: CreateDeployTokenRequest;
}

export interface ReserveRedeemUtxoEncodeObject extends EncodeObject {
  readonly typeUrl: typeof typeUrlReserveRedeemUtxoRequest;
  readonly value: ReserveRedeemUtxoRequest;
}
