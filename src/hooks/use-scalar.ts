import { ScalarAPI } from "@/apis/scalar";

export const useScalarNetParams = () =>
  ScalarAPI.useQuery("get", "/scalar/scalarnet/v1beta1/params", {});

export const useScalarProtocols = () =>
  ScalarAPI.useQuery("get", "/scalar/protocol/v1beta1", {});

export const useScalarCustodianGroups = () =>
  ScalarAPI.useQuery("get", "/scalar/covenant/v1beta1/custodian_groups", {});
export const useScalarChains = () =>
  ScalarAPI.useQuery("get", "/scalar/chains/v1beta1/chains", {});

export const useScalarOwnProtocol = (sender: string) =>
  ScalarAPI.useQuery(
    "get",
    "/scalar/protocol/v1beta1/protocol",
    {
      params: {
        query: {
          sender,
        },
      },
    },
    { enabled: !!sender },
  );
