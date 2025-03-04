import { operations } from "@/types/schema";
import type { EncodeObject } from "@cosmjs/proto-signing";
import type { CreateProtocolRequest } from "@scalar-lab/scalarjs-sdk/proto/scalar/protocol/v1beta1/tx";

export const typeUrlCreateProtocolRequest =
  "/scalar.protocol.v1beta1.CreateProtocolRequest";

export interface CreateProtocolEncodeObject extends EncodeObject {
  readonly typeUrl: typeof typeUrlCreateProtocolRequest;
  readonly value: CreateProtocolRequest;
}

export type CreateProtocolParams =
  operations["CreateProtocol"]["requestBody"]["content"]["application/json"];

export type LiquidityModelParams = NonNullable<
  CreateProtocolParams["attributes"]
>["model"];
