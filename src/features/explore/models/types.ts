import { TPageSearchParams } from "@/constants";

type TList<T> = {
  data: T[];
  total: number;
};

// Bridge
export type TExploreBridgeParams = {
  type?: string;
} & TPageSearchParams;

export type TExploreBridge = {
  id: string;
  type: string;
};

export type TExploreBridgeList = TList<TExploreBridge>;
