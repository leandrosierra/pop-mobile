import { useEffect } from "react";
import { applyStoredLanguage } from "@/localization/languageController";

export function LanguageBootstrap() {
  useEffect(() => {
    void applyStoredLanguage();
  }, []);

  return null;
}
