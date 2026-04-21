import i18n from "@/i18n";
import { normalizeLanguageCode, SupportedLanguageCode } from "@/localization/languages";
import { languageStorage } from "@/utils/languageStorage";

export async function applyAppLanguage(language?: string | null) {
  const normalized = normalizeLanguageCode(language);
  if (i18n.language !== normalized) await i18n.changeLanguage(normalized);
  await languageStorage.write(normalized);
  return normalized;
}

export async function applyStoredLanguage() {
  const stored = await languageStorage.read();
  if (!stored) return applyAppLanguage("fr");
  return applyAppLanguage(stored);
}

export function isSupportedLanguage(language: string): language is SupportedLanguageCode {
  return normalizeLanguageCode(language) === language;
}
