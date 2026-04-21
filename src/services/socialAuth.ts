import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "facebook" | "apple";

export async function canShowProvider(provider: SocialProvider) {
  if (provider === "apple") {
    return Platform.OS === "ios" && AppleAuthentication.isAvailableAsync();
  }
  return true;
}

export async function signInWithSocialProvider(provider: SocialProvider): Promise<never> {
  if (provider === "apple" && Platform.OS === "ios") {
    await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });
  }
  throw new Error("socialSetupRequired");
}
