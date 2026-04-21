import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "apple" | "facebook" | "instagram";

type ProviderConfig = {
  id: SocialProvider;
  label: string;
  clientIdEnv: string[];
  scopes: string[];
  discovery: AuthSession.AuthDiscoveryDocument;
  extraParams?: Record<string, string>;
};

export class SocialAuthCancelledError extends Error {}

export const socialProviders: { id: SocialProvider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" }
];

const providerConfigs: Record<SocialProvider, ProviderConfig> = {
  google: {
    id: "google",
    label: "Google",
    clientIdEnv: [
      "EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
    ],
    scopes: ["openid", "profile", "email"],
    discovery: {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth"
    },
    extraParams: {
      access_type: "offline"
    }
  },
  apple: {
    id: "apple",
    label: "Apple",
    clientIdEnv: ["EXPO_PUBLIC_APPLE_OAUTH_CLIENT_ID", "EXPO_PUBLIC_APPLE_SERVICE_ID"],
    scopes: ["name", "email"],
    discovery: {
      authorizationEndpoint: "https://appleid.apple.com/auth/authorize"
    }
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    clientIdEnv: ["EXPO_PUBLIC_FACEBOOK_OAUTH_CLIENT_ID", "EXPO_PUBLIC_FACEBOOK_APP_ID"],
    scopes: ["public_profile", "email"],
    discovery: {
      authorizationEndpoint: "https://www.facebook.com/dialog/oauth"
    }
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    clientIdEnv: ["EXPO_PUBLIC_INSTAGRAM_OAUTH_CLIENT_ID", "EXPO_PUBLIC_INSTAGRAM_APP_ID"],
    scopes: ["user_profile"],
    discovery: {
      authorizationEndpoint: "https://api.instagram.com/oauth/authorize"
    }
  }
};

const configuredValue = (keys: string[]) => keys.map((key) => process.env[key]).find((value) => Boolean(value));

const redirectUriForProvider = (provider: SocialProvider) => AuthSession.makeRedirectUri({
  scheme: "pop",
  path: `oauth/${provider}`,
  preferLocalhost: true
});

async function signInWithNativeApple() {
  if (Platform.OS !== "ios" || !(await AppleAuthentication.isAvailableAsync())) return false;

  await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL
    ]
  });
  return true;
}

export async function signInWithSocialProvider(provider: SocialProvider): Promise<never> {
  if (provider === "apple" && await signInWithNativeApple()) {
    throw new Error("socialSetupRequired");
  }

  const config = providerConfigs[provider];
  const clientId = configuredValue(config.clientIdEnv);
  if (!clientId) {
    throw new Error("socialSetupRequired");
  }

  const request = await AuthSession.loadAsync({
    clientId,
    redirectUri: redirectUriForProvider(provider),
    responseType: AuthSession.ResponseType.Code,
    scopes: config.scopes,
    extraParams: config.extraParams,
    usePKCE: true
  }, config.discovery);

  const result = await request.promptAsync(config.discovery);
  if (result.type !== "success") {
    throw new SocialAuthCancelledError();
  }

  throw new Error("socialSetupRequired");
}
