export const supportedLanguages = [
  { code: "fr", nativeName: "Français", regionName: "France, Belgique, Suisse" },
  { code: "en", nativeName: "English", regionName: "Ireland, Malta, Europe" },
  { code: "de", nativeName: "Deutsch", regionName: "Deutschland, Österreich, Schweiz" },
  { code: "es", nativeName: "Español", regionName: "España" },
  { code: "it", nativeName: "Italiano", regionName: "Italia, Svizzera" },
  { code: "pt", nativeName: "Português", regionName: "Portugal" },
  { code: "nl", nativeName: "Nederlands", regionName: "Nederland, België" },
  { code: "sv", nativeName: "Svenska", regionName: "Sverige, Finland" },
  { code: "da", nativeName: "Dansk", regionName: "Danmark" },
  { code: "fi", nativeName: "Suomi", regionName: "Suomi" },
  { code: "no", nativeName: "Norsk", regionName: "Norge" },
  { code: "is", nativeName: "Íslenska", regionName: "Ísland" },
  { code: "ga", nativeName: "Gaeilge", regionName: "Éire" },
  { code: "pl", nativeName: "Polski", regionName: "Polska" },
  { code: "cs", nativeName: "Čeština", regionName: "Česko" },
  { code: "sk", nativeName: "Slovenčina", regionName: "Slovensko" },
  { code: "hu", nativeName: "Magyar", regionName: "Magyarország" },
  { code: "ro", nativeName: "Română", regionName: "România, Moldova" },
  { code: "bg", nativeName: "Български", regionName: "България" },
  { code: "el", nativeName: "Ελληνικά", regionName: "Ελλάδα, Κύπρος" },
  { code: "hr", nativeName: "Hrvatski", regionName: "Hrvatska" },
  { code: "sl", nativeName: "Slovenščina", regionName: "Slovenija" },
  { code: "lt", nativeName: "Lietuvių", regionName: "Lietuva" },
  { code: "lv", nativeName: "Latviešu", regionName: "Latvija" },
  { code: "et", nativeName: "Eesti", regionName: "Eesti" },
  { code: "mt", nativeName: "Malti", regionName: "Malta" },
  { code: "sq", nativeName: "Shqip", regionName: "Shqipëri, Kosovë" },
  { code: "sr", nativeName: "Српски", regionName: "Србија, Црна Гора" },
  { code: "bs", nativeName: "Bosanski", regionName: "Bosna i Hercegovina" },
  { code: "mk", nativeName: "Македонски", regionName: "Северна Македонија" },
  { code: "uk", nativeName: "Українська", regionName: "Україна" },
  { code: "ru", nativeName: "Русский", regionName: "Europe orientale" },
  { code: "tr", nativeName: "Türkçe", regionName: "Türkiye, Kıbrıs" },
  { code: "lb", nativeName: "Lëtzebuergesch", regionName: "Lëtzebuerg" },
  { code: "be", nativeName: "Беларуская", regionName: "Беларусь" },
  { code: "ca", nativeName: "Català", regionName: "Andorra, Catalunya" }
] as const;

export type SupportedLanguageCode = (typeof supportedLanguages)[number]["code"];

export const supportedLanguageCodes = supportedLanguages.map((language) => language.code) as SupportedLanguageCode[];

export function normalizeLanguageCode(code?: string | null): SupportedLanguageCode {
  const normalized = String(code || "fr").trim().toLowerCase().split(/[-_]/)[0];
  return supportedLanguageCodes.includes(normalized as SupportedLanguageCode) ? (normalized as SupportedLanguageCode) : "fr";
}

export function toApiLanguageCode(code: SupportedLanguageCode) {
  return code.toUpperCase();
}
