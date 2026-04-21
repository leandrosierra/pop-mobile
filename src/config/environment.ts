import { useEffect } from "react";

export const environmentLabel = (process.env.EXPO_PUBLIC_POP_ENV_LABEL || "DEV").toUpperCase();

export function pageTitle(title = "POP") {
  return `${title.replace(/!$/, "")} - ${environmentLabel}`;
}

export function useDocumentTitle(title = "POP") {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = pageTitle(title);
    }
  }, [title]);
}
