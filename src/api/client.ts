import { z } from "zod";
import { useOfflineStore } from "@/store/offlineStore";

const configuredApiOrigin = process.env.EXPO_PUBLIC_POP_API_ORIGIN || "http://localhost:8080";
export const apiOrigin =
  configuredApiOrigin === "same-origin" && typeof window !== "undefined"
    ? window.location.origin
    : configuredApiOrigin;
const apiMode = process.env.EXPO_PUBLIC_POP_API_MODE;

export const isLegacyApi = (() => {
  const host = new URL(apiOrigin).hostname;
  if (apiMode) return apiMode === "legacy";
  return host === "localhost" || host === "127.0.0.1";
})();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export class ApiNetworkError extends Error {
  constructor(message = "Connexion indisponible") {
    super(message);
  }
}

export function isApiNetworkError(error: unknown): error is ApiNetworkError {
  return error instanceof ApiNetworkError;
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
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body
    });
  } catch {
    useOfflineStore.getState().setOnline(false);
    throw new ApiNetworkError();
  }

  useOfflineStore.getState().setOnline(true);

  if ([502, 503, 504].includes(response.status)) {
    useOfflineStore.getState().setOnline(false);
    throw new ApiNetworkError(await readErrorMessage(response));
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  return schema ? schema.parse(data) : (data as T);
}

export async function legacyApiRequest<T>(path: string, options: ApiRequestOptions<T> = {}) {
  return apiRequest<T>(path, options);
}

export async function checkApiReachability() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3_000);
  try {
    await fetch(buildUrl("/"), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json, text/plain, */*" }
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
