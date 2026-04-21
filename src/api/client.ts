import { z } from "zod";

const configuredApiOrigin = process.env.EXPO_PUBLIC_POP_API_ORIGIN || "http://localhost:8080";
export const apiOrigin =
  configuredApiOrigin === "same-origin" && typeof window !== "undefined"
    ? window.location.origin
    : configuredApiOrigin;
const apiMode = process.env.EXPO_PUBLIC_POP_API_MODE;
const basicAuth = process.env.EXPO_PUBLIC_POP_API_BASIC_AUTH || "user:password";

const encodeBase64 = (value: string) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let index = 0;

  while (index < value.length) {
    const chr1 = value.charCodeAt(index++);
    const chr2 = value.charCodeAt(index++);
    const chr3 = value.charCodeAt(index++);
    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (Number.isNaN(chr2)) {
      enc3 = 64;
      enc4 = 64;
    } else if (Number.isNaN(chr3)) {
      enc4 = 64;
    }

    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
  }

  return output;
};

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

export function legacyToken(userId: number | string) {
  return `legacy:${userId}`;
}

export function legacyUserIdFromToken(token: string) {
  if (!token.startsWith("legacy:")) throw new ApiError("Session locale invalide", 401);
  return Number(token.slice("legacy:".length));
}

export async function legacyApiRequest<T>(path: string, options: ApiRequestOptions<T> = {}) {
  return apiRequest<T>(path, {
    ...options,
    headers: {
      Authorization: `Basic ${encodeBase64(basicAuth)}`,
      ...options.headers
    }
  });
}
