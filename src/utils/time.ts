export function normalizeTimestamp(value?: string | number | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function formatTimestampBadge(value?: string | number | Date | null, locale = "fr") {
  const normalized = normalizeTimestamp(value);
  if (!normalized) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(normalized));
}
