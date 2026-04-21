import {
  emailLoginResponseSchema,
  popUserSchema,
  refreshTokenResponseSchema
} from "@/domain/schemas";
import { apiRequest } from "./client";

export const authApi = {
  signInWithEmail(email: string, password: string) {
    return apiRequest("/pop/user/email-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      schema: emailLoginResponseSchema
    });
  },
  refreshToken(refreshToken: string) {
    return apiRequest("/pop/user/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      schema: refreshTokenResponseSchema
    });
  },
  currentUser(token: string) {
    return apiRequest("/pop/user/current", {
      method: "GET",
      token,
      schema: popUserSchema
    });
  },
  createEmailAccount(name: string, email: string) {
    return apiRequest<void>("/pop/user/email-signup", {
      method: "POST",
      body: JSON.stringify({ emailId: email, nickname: name })
    });
  },
  forgotPassword(email: string) {
    return apiRequest<void>("/pop/user/email-forgot-password", {
      method: "POST",
      body: JSON.stringify({ mailId: email })
    });
  },
  deleteAccount(token: string) {
    return apiRequest<void>("/pop/user/current", {
      method: "DELETE",
      token
    });
  }
};
