export type TProtocol = {
  bitcoin_pubkey?: string;
  scalar_pubkey?: string;
  scalar_address?: string;
  asset?: TAsset;
  name?: string;
  tag?: string;
  attribute?: {
    model: "LIQUIDITY_MODEL_POOLING" | "LIQUIDITY_MODEL_TRANSACTIONAL";
  };
  status: "STATUS_UNSPECIFIED" | "STATUS_ACTIVATED" | "STATUS_DEACTIVATED";
  custodian_group?: {
    uid?: string;
    name?: string;
    btc_pubkey?: string;
    quorum?: number;
    status: "STATUS_UNSPECIFIED" | "STATUS_ACTIVATED" | "STATUS_DEACTIVATED";
    description?: string;
    custodians?: Array<{
      name?: string;
      btc_pubkey?: string;
      status: "STATUS_UNSPECIFIED" | "STATUS_ACTIVATED" | "STATUS_DEACTIVATED";
      description?: string;
    }>;
  };
  chains?: TProtocolChain[];
};

export type TProtocolChain = {
  chain?: string;
  name?: string;
  address?: string;
};

export type TAsset = {
  chain?: string;
  name?: string;
};
