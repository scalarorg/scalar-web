import { ScalarAPI } from "@/apis/scalar";

export const useScalarNetParams = () =>
  ScalarAPI.useQuery("get", "/scalar/scalarnet/v1beta1/params", {});

export const useScalarProtocols = () =>
  ScalarAPI.useQuery("get", "/scalar/protocol/v1beta1", {});
