import { create } from "zustand";
import { authApi } from "@/api/auth";
import { PopUser } from "@/domain/schemas";
import { tokenStorage } from "@/utils/tokenStorage";

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
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrate() {
    if (get().hydrated) return Promise.resolve();
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      const tokens = await tokenStorage.read();
      if (!tokens.accessToken) {
        set({ hydrated: true, user: null, accessToken: null, refreshToken: null });
        return;
      }

      try {
        const user = await authApi.currentUser(tokens.accessToken);
        set({ hydrated: true, user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      } catch {
        await tokenStorage.clear();
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
    const user = await authApi.currentUser(tokens.token);
    set({ user, accessToken: tokens.token, refreshToken: tokens.refreshToken, hydrated: true });
    return user;
  },
  async refreshCurrentUser() {
    const token = get().requireToken();
    const user = await authApi.currentUser(token);
    set({ user });
    return user;
  },
  createEmailAccount(name, email) {
    return authApi.createEmailAccount(name, email);
  },
  forgotPassword(email) {
    return authApi.forgotPassword(email);
  },
  async signOut() {
    hydrationPromise = null;
    await tokenStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null, hydrated: true });
  },
  async deleteAccount() {
    const token = get().requireToken();
    await authApi.deleteAccount(token);
    await get().signOut();
  }
}));
