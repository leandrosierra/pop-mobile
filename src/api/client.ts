import { z } from "zod";

const apiOrigin = process.env.EXPO_PUBLIC_POP_API_ORIGIN || "https://pop-litic.com";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

type ApiRequestOptions<T> = RequestInit & {
  token?: string | null;
  schema?: z.ZodType<T>;
  query?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, query?: ApiRequestOptions<unknown>["query"]) => {
  const url = new URL(path, apiOrigin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const readErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (!text) return `Erreur API ${response.status}`;
  try {
    const json = JSON.parse(text) as { errors?: string[]; message?: string };
    return json.errors?.[0] || json.message || text;
  } catch {
    return text;
  }
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions<T> = {}) {
  const { token, schema, query, headers, body, ...init } = options;
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  return schema ? schema.parse(data) : (data as T);
}
