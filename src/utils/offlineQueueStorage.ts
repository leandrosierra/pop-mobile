import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const queueKey = "pop.offlineQueue";

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

export const offlineQueueStorage = {
  async read<T>() {
    const raw = await getItem(queueKey);
    if (!raw) return [] as T[];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [] as T[];
    }
  },
  write<T>(queue: T[]) {
    return setItem(queueKey, JSON.stringify(queue));
  },
  clear() {
    return deleteItem(queueKey);
  }
};
