import { useScalarNetParams } from "@/hooks";
import { decodeScalarBytesToString } from "@/lib/scalar";
import { TNetwork, VaultUtils } from "@scalar-lab/bitcoin-vault";
import { useNetwork } from "../providers/network-provider";

type TVaultUtilsInstances = Record<
  string,
  ReturnType<
    typeof import("@scalar-lab/bitcoin-vault").VaultUtils["getInstance"]
  >
>;

const vaultUtilsInstances: TVaultUtilsInstances = {} as TVaultUtilsInstances;

export const useVault = (protocolTag?: string) => {
  const { data: scalarnetParams, isLoading: isLoadingScalarnetParams } =
    useScalarNetParams();
  const { network } = useNetwork();

  if (!protocolTag) {
    throw new Error("Protocol tag not found");
  }

  if (isLoadingScalarnetParams) {
    return null;
  }

  if (!scalarnetParams) {
    throw new Error("Scalarnet params not found");
  }
  if (!scalarnetParams.params?.tag) {
    throw new Error("Scalarnet params tag not found");
  }
  if (!scalarnetParams.params?.version) {
    throw new Error("Scalarnet params version not found");
  }

  const aliasedNetwork = network as TNetwork;

  // Create a unique key for each combination of parameters
  const instanceKey = `${aliasedNetwork}-${scalarnetParams.params.tag}-${scalarnetParams.params.version}-${protocolTag}`;

  if (!vaultUtilsInstances[instanceKey]) {
    vaultUtilsInstances[instanceKey] = VaultUtils.getInstance(
      decodeScalarBytesToString(scalarnetParams.params.tag),
      protocolTag,
      Number(scalarnetParams.params.version),
      aliasedNetwork,
    );
  }

  return vaultUtilsInstances[instanceKey];
};
