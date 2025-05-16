import { ScalarAPI } from "@/apis/scalar";
import { TStandaloneCommnand } from "@/types/types";

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

export const useStandaloneCommand = (hex: string) =>
  ScalarAPI.useQuery(
    "get",
    "/scalar/covenant/v1beta1/standalone_command",
    {
      params: {
        query: {
          id: Buffer.from(hex, "hex").toString("base64"),
        },
      },
    },
    { enabled: !!hex },
  );
export const useScalarPollingResult = () => {};

interface TimeoutError extends Error {
  name: "TimeoutError";
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface PollingOptions {
  hex: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
  validator: (data: TStandaloneCommnand) => boolean;
}

export const useScalarStandaloneCommandResult = () => {
  const startPolling = async (options: PollingOptions) => {
    const {
      hex,
      timeoutMs = 60000,
      pollIntervalMs = 3000,
      validator,
    } = options;

    let timedOut = false;
    const pollTimeout = setTimeout(() => {
      timedOut = true;
    }, timeoutMs);

    const poll = async (): Promise<TStandaloneCommnand> => {
      if (timedOut) {
        throw new TimeoutError(
          `Polling timed out after ${timeoutMs / 1000} seconds`,
        );
      }

      const base64Id = Buffer.from(hex, "hex").toString("base64");
      const response = await fetch(
        `${import.meta.env.VITE_SCALAR_REST_URL}/scalar/covenant/v1beta1/standalone_command?id=${encodeURIComponent(base64Id)}`,
      );

      if (!response.ok) {
        await sleep(pollIntervalMs);
        return poll();
      }

      const data = await response.json();
      if (!data) {
        await sleep(pollIntervalMs);
        return poll();
      }
      if (validator(data)) {
        return data;
      }

      await sleep(pollIntervalMs);
      return poll();
    };

    return new Promise<TStandaloneCommnand>((resolve, reject) => {
      poll()
        .then((value) => {
          clearTimeout(pollTimeout);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(pollTimeout);
          reject(error);
        });
    });
  };

  return { startPolling };
};
