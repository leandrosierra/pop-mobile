import {
  emailLoginResponseSchema,
  popUserSchema,
  refreshTokenResponseSchema
} from "@/domain/schemas";
import { apiRequest, isLegacyApi, legacyApiRequest, legacyToken, legacyUserIdFromToken } from "./client";
import { LegacyUser, mapLegacyUser } from "./legacy";

export const authApi = {
  async signInWithEmail(email: string, password: string) {
    if (isLegacyApi) {
      const user = await legacyApiRequest<LegacyUser>("/user/login", {
        method: "POST",
        body: JSON.stringify({ login: email, password })
      });
      return {
        token: legacyToken(user.id),
        refreshToken: legacyToken(user.id)
      };
    }

    return apiRequest("/pop/user/email-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      schema: emailLoginResponseSchema
    });
  },
  refreshToken(refreshToken: string) {
    if (isLegacyApi) {
      return Promise.resolve({ token: refreshToken, refreshToken });
    }

    return apiRequest("/pop/user/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      schema: refreshTokenResponseSchema
    });
  },
  async currentUser(token: string) {
    if (isLegacyApi) {
      return mapLegacyUser(await legacyApiRequest<LegacyUser>(`/user/${legacyUserIdFromToken(token)}`));
    }

    return apiRequest("/pop/user/current", {
      method: "GET",
      token,
      schema: popUserSchema
    });
  },
  createEmailAccount(name: string, email: string) {
    if (isLegacyApi) {
      return legacyApiRequest<void>("/user/create", {
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
    }

    return apiRequest<void>("/pop/user/email-signup", {
      method: "POST",
      body: JSON.stringify({ emailId: email, nickname: name })
    });
  },
  forgotPassword(email: string) {
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>("/pop/user/email-forgot-password", {
      method: "POST",
      body: JSON.stringify({ mailId: email })
    });
  },
  deleteAccount(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<void>(`/user/delete/${legacyUserIdFromToken(token)}`, {
        method: "DELETE"
      });
    }

    return apiRequest<void>("/pop/user/current", {
      method: "DELETE",
      token
    });
  }
};
