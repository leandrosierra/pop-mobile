import { create } from "zustand";
import { authApi } from "@/api/auth";
import { isApiNetworkError } from "@/api/client";
import { PopInterest, PopLocation, PopUser } from "@/domain/schemas";
import { applyAppLanguage } from "@/localization/languageController";
import { normalizeLanguageCode, SupportedLanguageCode } from "@/localization/languages";
import { useOfflineStore } from "@/store/offlineStore";
import { tokenStorage } from "@/utils/tokenStorage";
import { userStorage } from "@/utils/userStorage";

type AuthState = {
  hydrated: boolean;
  user: PopUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrate: () => Promise<void>;
  requireToken: () => string;
  signInWithEmail: (email: string, password: string) => Promise<PopUser>;
  refreshCurrentUser: () => Promise<PopUser | null>;
  createEmailAccount: (name: string, email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  setUserGeoChoices: (locations: PopLocation[]) => void;
  setUserInterests: (interests: PopInterest[]) => void;
  removeUserGeoChoice: (id: string) => void;
  removeUserInterestChoice: (code: string) => void;
  updateLanguage: (language: SupportedLanguageCode) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

const withNormalizedLanguage = (user: PopUser): PopUser => ({
  ...user,
  language: normalizeLanguageCode(user.language)
});

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrate() {
    if (get().hydrated) return Promise.resolve();
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      const [tokens, cachedUser] = await Promise.all([tokenStorage.read(), userStorage.read()]);
      if (!tokens.accessToken) {
        set({ hydrated: true, user: null, accessToken: null, refreshToken: null });
        return;
      }

      try {
        const user = withNormalizedLanguage(await authApi.currentUser(tokens.accessToken));
        await applyAppLanguage(user.language);
        await userStorage.write(user);
        set({ hydrated: true, user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      } catch (error) {
        if (isApiNetworkError(error) && cachedUser) {
          await applyAppLanguage(cachedUser.language);
          set({ hydrated: true, user: cachedUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
          return;
        }
        await tokenStorage.clear();
        await userStorage.clear();
        set({ hydrated: true, user: null, accessToken: null, refreshToken: null });
      }
    })().finally(() => {
      hydrationPromise = null;
    });

    return hydrationPromise;
  },
  requireToken() {
    const token = get().accessToken;
    if (!token) throw new Error("Utilisateur non authentifié");
    return token;
  },
  async signInWithEmail(email, password) {
    const tokens = await authApi.signInWithEmail(email, password);
    await tokenStorage.write(tokens.token, tokens.refreshToken);
    const user = withNormalizedLanguage(await authApi.currentUser(tokens.token));
    await applyAppLanguage(user.language);
    await userStorage.write(user);
    set({ user, accessToken: tokens.token, refreshToken: tokens.refreshToken, hydrated: true });
    return user;
  },
  async refreshCurrentUser() {
    const token = get().requireToken();
    let user: PopUser;
    try {
      user = withNormalizedLanguage(await authApi.currentUser(token));
    } catch (error) {
      if (isApiNetworkError(error) && get().user) return get().user;
      throw error;
    }
    await applyAppLanguage(user.language);
    await userStorage.write(user);
    set({ user });
    return user;
  },
  createEmailAccount(name, email) {
    return authApi.createEmailAccount(name, email);
  },
  forgotPassword(email) {
    return authApi.forgotPassword(email);
  },
  setUserGeoChoices(locations) {
    const user = get().user;
    if (user) {
      const nextUser = { ...user, userChoiceGeo: locations };
      set({ user: nextUser });
      void userStorage.write(nextUser);
    }
  },
  setUserInterests(interests) {
    const user = get().user;
    if (user) {
      const nextUser = {
        ...user,
        userInterest: interests.map((interest, index) => ({
          code: interest.code,
          label: interest.label,
          priority: index + 1
        }))
      };
      set({ user: nextUser });
      void userStorage.write(nextUser);
    }
  },
  removeUserGeoChoice(id) {
    const user = get().user;
    if (user) {
      const nextUser = { ...user, userChoiceGeo: user.userChoiceGeo.filter((location) => location.id !== id) };
      set({ user: nextUser });
      void userStorage.write(nextUser);
    }
  },
  removeUserInterestChoice(code) {
    const user = get().user;
    if (user) {
      const nextUser = { ...user, userInterest: user.userInterest.filter((interest) => interest.code !== code) };
      set({ user: nextUser });
      void userStorage.write(nextUser);
    }
  },
  async updateLanguage(language) {
    const normalized = normalizeLanguageCode(language);
    await applyAppLanguage(normalized);
    const user = get().user;
    if (user) {
      const nextUser = { ...user, language: normalized };
      set({ user: nextUser });
      await userStorage.write(nextUser);
    }

    const token = get().accessToken;
    if (!token) return;

    if (!useOfflineStore.getState().online) {
      await useOfflineStore.getState().enqueueOperation({ type: "SET_LANGUAGE", token, payload: { language: normalized } });
      return;
    }

    try {
      await authApi.updateLanguage(token, normalized);
    } catch (error) {
      if (!isApiNetworkError(error)) throw error;
      await useOfflineStore.getState().enqueueOperation({ type: "SET_LANGUAGE", token, payload: { language: normalized } });
    }
  },
  async signOut() {
    hydrationPromise = null;
    await useOfflineStore.getState().clearQueue();
    await tokenStorage.clear();
    await userStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null, hydrated: true });
  },
  async deleteAccount() {
    const token = get().requireToken();
    await authApi.deleteAccount(token);
    await get().signOut();
  }
}));
