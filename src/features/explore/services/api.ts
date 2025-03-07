const BASE_URL = import.meta.env.VITE_SCALAR_SCAN_URL as string;

export const getByPostMethod = async <
  TParams extends Record<string, unknown>,
  TResponse,
>(
  url: string,
  params: TParams,
): Promise<TResponse | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
