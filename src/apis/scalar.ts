import { paths } from "@/types/schema";
import createFetchClient from "openapi-fetch";
import createClient, { OpenapiQueryClient } from "openapi-react-query";

const scalarFetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_SCALAR_API_URL,
});

export const ScalarAPI: OpenapiQueryClient<paths> =
  createClient(scalarFetchClient);
