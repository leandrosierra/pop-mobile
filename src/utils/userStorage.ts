import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { PopUser } from "@/domain/schemas";

const userKey = "pop.currentUser";

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

export const userStorage = {
  async read() {
    const raw = await getItem(userKey);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as PopUser;
      if (!user?.uid || !user.name) return null;
      return {
        uid: user.uid,
        name: user.name,
        email: user.email || "",
        role: user.role || "USER",
        userChoiceGeo: Array.isArray(user.userChoiceGeo) ? user.userChoiceGeo : [],
        userInterest: Array.isArray(user.userInterest) ? user.userInterest : []
      };
    } catch {
      return null;
    }
  },
  write(user: PopUser) {
    return setItem(userKey, JSON.stringify(user));
  },
  clear() {
    return deleteItem(userKey);
  }
};
