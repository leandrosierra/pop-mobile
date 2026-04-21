import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const accessTokenKey = "pop.accessToken";
const refreshTokenKey = "pop.refreshToken";

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

export const tokenStorage = {
  async read() {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(accessTokenKey),
      getItem(refreshTokenKey)
    ]);
    return { accessToken, refreshToken };
  },
  async write(accessToken: string, refreshToken: string) {
    await Promise.all([
      setItem(accessTokenKey, accessToken),
      setItem(refreshTokenKey, refreshToken)
    ]);
  },
  async clear() {
    await Promise.all([
      deleteItem(accessTokenKey),
      deleteItem(refreshTokenKey)
    ]);
  }
};
