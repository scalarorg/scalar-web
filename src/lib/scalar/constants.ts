import { GasPrice, StdFee } from "@cosmjs/stargate";

export const STANDARD_FEE: StdFee = {
  amount: [
    {
      denom: "ascal",
      amount: "100000",
    },
  ],
  gas: "500000",
};

export const STANDARD_GAS_PRICE = GasPrice.fromString("0.025ascal");
