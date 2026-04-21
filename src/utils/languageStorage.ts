import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { normalizeLanguageCode, SupportedLanguageCode } from "@/localization/languages";

const languageKey = "pop.language";

const webStorage = {
  getItem: async (key: string) => (typeof localStorage === "undefined" ? null : localStorage.getItem(key)),
  setItem: async (key: string, value: string) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  deleteItem: async (key: string) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  }
};

const getItem = (key: string) => (
  Platform.OS === "web" ? webStorage.getItem(key) : SecureStore.getItemAsync(key)
);

const setItem = (key: string, value: string) => (
  Platform.OS === "web" ? webStorage.setItem(key, value) : SecureStore.setItemAsync(key, value)
);

const deleteItem = (key: string) => (
  Platform.OS === "web" ? webStorage.deleteItem(key) : SecureStore.deleteItemAsync(key)
);

export const languageStorage = {
  async read() {
    const value = await getItem(languageKey);
    return value ? normalizeLanguageCode(value) : null;
  },
  write(language: SupportedLanguageCode) {
    return setItem(languageKey, language);
  },
  clear() {
    return deleteItem(languageKey);
  }
};
