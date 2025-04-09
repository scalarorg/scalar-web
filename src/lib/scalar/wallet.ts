import { ChainInfo } from "@keplr-wallet/types";

const rpc = import.meta.env.VITE_SCALAR_RPC_URL || "ws://localhost:26657";
const rest = import.meta.env.VITE_SCALAR_REST_URL || "http://localhost:1317";

console.log("RPC", rpc);
console.log("REST", rest);

export const scalarConfig = (): ChainInfo =>
  ({
    chainId: "cosmos|73475",
    chainName: "Scalar",
    rpc,
    rest,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "scalar",
      bech32PrefixAccPub: "scalar" + "pub",
      bech32PrefixValAddr: "scalar" + "valoper",
      bech32PrefixValPub: "scalar" + "valoperpub",
      bech32PrefixConsAddr: "scalar" + "valcons",
      bech32PrefixConsPub: "scalar" + "valconspub",
    },
    currencies: [
      {
        coinDenom: "ASCAL",
        coinMinimalDenom: "ascal",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASCAL",
        coinMinimalDenom: "ascal",
        coinDecimals: 18,
        gasPriceStep: {
          low: 0.0025,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "ASCAL",
      coinMinimalDenom: "ascal",
      coinDecimals: 18,
    },
    features: ["ibc-transfer"],
  }) as const;
