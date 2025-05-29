const BASE_URL = import.meta.env.VITE_SCALAR_SCAN_URL;
const headers: HeadersInit = { "Content-Type": "application/json" };

const fetchData = async <TResponse>(url: string, init: RequestInit): Promise<TResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/${url}`, {
      headers,
      ...init
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (_error) {
    return null;
  }
};

const buildQueryString = (params: Record<string, unknown>): string => {
  const queryString = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]))
  ).toString();
  return queryString ? `?${queryString}` : "";
};

export const postMethod = async <TBody, TResponse>(url: string, body: TBody): Promise<TResponse | null> => {
  return await fetchData<TResponse>(url, {
    method: "POST",
    body: JSON.stringify(body)
  });
};

export const getByPostMethod = async <TParams, TResponse>(
  url: string,
  params: TParams
): Promise<TResponse | null> => postMethod<TParams, TResponse>(url, params);

export const getByGetMethod = async <TParams extends Record<string, unknown>, TResponse>(
  url: string,
  params: TParams
): Promise<TResponse | null> => {
  return await fetchData<TResponse>(`${url}${buildQueryString(params)}`, {
    method: "GET"
  });
};
