import { operations } from "@/types/schema";

export type CreateProtocolParams =
  operations["CreateProtocol"]["requestBody"]["content"]["application/json"];

export type LiquidityModelParams = NonNullable<
  CreateProtocolParams["attributes"]
>["model"];

export type CreateDeployTokenParams =
  operations["CreateDeployToken"]["requestBody"]["content"]["application/json"];
