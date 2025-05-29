import { paths } from '@/types/schema';
import createFetchClient from 'openapi-fetch';
import createClient, { OpenapiQueryClient } from 'openapi-react-query';

export const scalarFetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_SCALAR_REST_URL
});

export const ScalarAPI: OpenapiQueryClient<paths> = createClient(scalarFetchClient);
