import { ScalarAPI } from "@/apis/scalar";

export const useScalarNetParams = () =>
  ScalarAPI.useQuery("get", "/scalar/scalarnet/v1beta1/params", {});
