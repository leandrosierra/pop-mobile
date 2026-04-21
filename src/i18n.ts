import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "@/localization/resources";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: "fr",
  lng: "fr",
  resources,
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
