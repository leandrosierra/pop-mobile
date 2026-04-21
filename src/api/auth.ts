import { languageResponseSchema } from "@/domain/languageSchemas";
import { SupportedLanguageCode, toApiLanguageCode } from "@/localization/languages";
import { apiRequest } from "./client";
import { BackendUser, mapBackendUser } from "./backend";

type LoginResponse = {
  token: string;
  refreshToken: string;
  user: BackendUser;
};

export const authApi = {
  async signInWithEmail(email: string, password: string) {
    const response = await apiRequest<LoginResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify({ login: email, password })
    });
    return {
      token: response.token,
      refreshToken: response.refreshToken
    };
  },
  refreshToken(refreshToken: string) {
    return Promise.resolve({ token: refreshToken, refreshToken });
  },
  async currentUser(token: string) {
    return mapBackendUser(await apiRequest<BackendUser>("/user/current", { token }));
  },
  createEmailAccount(name: string, email: string) {
    return apiRequest<void>("/user/create", {
      method: "POST",
      body: JSON.stringify({
        login: email,
        nom: name,
        prenom: "",
        email,
        password: "user",
        actif: true,
        role: { idRole: 2 }
      })
    });
  },
  forgotPassword(_email: string) {
    return Promise.resolve();
  },
  updateLanguage(token: string, language: SupportedLanguageCode) {
    return apiRequest("/user/current/language", {
      method: "PUT",
      token,
      body: JSON.stringify({ code: toApiLanguageCode(language) }),
      schema: languageResponseSchema
    });
  },
  deleteAccount(token: string) {
    return apiRequest<void>("/user/current", { method: "DELETE", token });
  }
};
