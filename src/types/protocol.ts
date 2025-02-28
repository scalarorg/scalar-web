import { ELiquidityModel, EProtocolStatus } from "@/enums";

export type TProtocolModel = `${ELiquidityModel}`;

export type TProtocolStatus = `${EProtocolStatus}`;

export type TProtocol = {
  bitcoin_pubkey?: string;
  scalar_pubkey?: string;
  scalar_address?: string;
  asset?: TAsset;
  name?: string;
  tag?: string;
  attributes?: {
    model: TProtocolModel;
  };
  avatar?: string | null;
  status: TProtocolStatus;
  custodian_group?: {
    uid?: string;
    name?: string;
    bitcoin_pubkey?: string;
    quorum?: number;
    status: TProtocolStatus;
    description?: string;
    custodians?: TCustodian[];
  };
  chains?: TProtocolChain[];
};

export type TProtocolChain = {
  chain?: string;
  name?: string;
  address?: string;
};

export type TCustodian = {
  name?: string;
  bitcoin_pubkey?: string;
  status: TProtocolStatus;
  description?: string;
};

export type TAsset = {
  chain?: string;
  name?: string;
};
