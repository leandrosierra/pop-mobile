import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "apple" | "facebook" | "instagram";

export type SocialOAuthPayload = {
  provider: SocialProvider;
  idToken?: string;
  accessToken?: string;
  authorizationCode?: string;
  redirectUri?: string;
  providerUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

type ProviderConfig = {
  clientIdEnv: string[];
  scopes: string[];
  responseType: AuthSession.ResponseType;
  usePKCE: boolean;
  discovery: AuthSession.AuthDiscoveryDocument;
  tokenEndpoint?: string;
  extraParams?: Record<string, string>;
};

export class SocialAuthCancelledError extends Error {
  constructor() {
    super("socialAuthCancelled");
  }
}

export const socialProviders: { id: SocialProvider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" }
];

const providerConfigs: Record<Exclude<SocialProvider, "apple">, ProviderConfig> = {
  google: {
    clientIdEnv: [
      "EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
    ],
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    discovery: {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth"
    },
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    extraParams: {
      access_type: "offline"
    }
  },
  facebook: {
    clientIdEnv: ["EXPO_PUBLIC_FACEBOOK_OAUTH_CLIENT_ID", "EXPO_PUBLIC_FACEBOOK_APP_ID"],
    scopes: ["public_profile", "email"],
    responseType: AuthSession.ResponseType.Token,
    usePKCE: false,
    discovery: {
      authorizationEndpoint: "https://www.facebook.com/dialog/oauth"
    }
  },
  instagram: {
    clientIdEnv: ["EXPO_PUBLIC_INSTAGRAM_OAUTH_CLIENT_ID", "EXPO_PUBLIC_INSTAGRAM_APP_ID"],
    scopes: ["user_profile"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
    discovery: {
      authorizationEndpoint: "https://api.instagram.com/oauth/authorize"
    }
  }
};

const configuredValue = (keys: string[]) => keys.map((key) => process.env[key]?.trim()).find((value) => Boolean(value));

const redirectUriForProvider = (provider: SocialProvider) => AuthSession.makeRedirectUri({
  scheme: "pop",
  path: `oauth/${provider}`,
  preferLocalhost: true
});

export async function requestSocialCredential(provider: SocialProvider): Promise<SocialOAuthPayload> {
  if (provider === "apple") {
    return requestAppleCredential();
  }
  if (provider === "google") {
    return requestGoogleCredential();
  }
  if (provider === "facebook") {
    return requestFacebookCredential();
  }
  return requestInstagramCredential();
}

async function requestAppleCredential(): Promise<SocialOAuthPayload> {
  if (Platform.OS !== "ios" || !(await AppleAuthentication.isAvailableAsync())) {
    throw new Error("socialSetupRequired");
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ERR_REQUEST_CANCELED") {
      throw new SocialAuthCancelledError();
    }
    throw error;
  }

  if (!credential.identityToken) {
    throw new Error("socialSetupRequired");
  }

  return {
    provider: "apple",
    idToken: credential.identityToken,
    authorizationCode: credential.authorizationCode || undefined,
    providerUserId: credential.user,
    email: credential.email || undefined,
    firstName: credential.fullName?.givenName || undefined,
    lastName: credential.fullName?.familyName || undefined,
    name: [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ") || undefined
  };
}

async function requestGoogleCredential(): Promise<SocialOAuthPayload> {
  const { config, request, result, redirectUri } = await promptProvider("google");
  const code = result.params.code;
  if (!code || !request.codeVerifier) {
    throw new Error("socialSetupRequired");
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync({
    clientId: configuredClientId(config),
    code,
    redirectUri,
    extraParams: {
      code_verifier: request.codeVerifier
    }
  }, { tokenEndpoint: config.tokenEndpoint });

  if (!tokenResponse.idToken) {
    throw new Error("socialSetupRequired");
  }

  return {
    provider: "google",
    idToken: tokenResponse.idToken,
    accessToken: tokenResponse.accessToken || undefined
  };
}

async function requestFacebookCredential(): Promise<SocialOAuthPayload> {
  const { result } = await promptProvider("facebook");
  const accessToken = result.params.access_token;
  if (!accessToken) {
    throw new Error("socialSetupRequired");
  }
  return { provider: "facebook", accessToken };
}

async function requestInstagramCredential(): Promise<SocialOAuthPayload> {
  const { result, redirectUri } = await promptProvider("instagram");
  const authorizationCode = result.params.code;
  if (!authorizationCode) {
    throw new Error("socialSetupRequired");
  }
  return { provider: "instagram", authorizationCode, redirectUri };
}

async function promptProvider(provider: Exclude<SocialProvider, "apple">) {
  const config = providerConfigs[provider];
  const clientId = configuredClientId(config);
  const redirectUri = redirectUriForProvider(provider);
  const request = await AuthSession.loadAsync({
    clientId,
    redirectUri,
    responseType: config.responseType,
    scopes: config.scopes,
    extraParams: config.extraParams,
    usePKCE: config.usePKCE
  }, config.discovery);

  const result = await request.promptAsync(config.discovery);
  if (result.type === "cancel" || result.type === "dismiss") {
    throw new SocialAuthCancelledError();
  }
  if (result.type !== "success") {
    throw new Error("socialSetupRequired");
  }
  return { config, request, result, redirectUri };
}

function configuredClientId(config: ProviderConfig) {
  const clientId = configuredValue(config.clientIdEnv);
  if (!clientId) {
    throw new Error("socialSetupRequired");
  }
  return clientId;
}
