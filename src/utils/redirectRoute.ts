import type { Href } from "expo-router";

export function safeInternalRoute(value: unknown) {
  const route = Array.isArray(value) ? value[0] : value;
  if (typeof route !== "string") return null;
  const trimmed = route.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/login") || trimmed.startsWith("/signup") || trimmed.startsWith("/forgot-password")) return null;
  return trimmed as Href;
}

export function routeWithQuery(pathname: string, params: Record<string, unknown>, excludedKeys: string[] = []) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (excludedKeys.includes(key) || value == null) return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => searchParams.append(key, String(item)));
  });
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function currentRouteWithQuery(pathname: string, params: Record<string, unknown>, excludedKeys: string[] = []) {
  if (typeof window !== "undefined" && window.location.pathname) {
    return `${window.location.pathname}${window.location.search}`;
  }
  return routeWithQuery(pathname, params, excludedKeys);
}
