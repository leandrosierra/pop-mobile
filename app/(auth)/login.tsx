import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { FormField } from "@/components/FormField";
import { SocialProviderIcon } from "@/components/SocialProviderIcon";
import { pageTitle, useDocumentTitle } from "@/config/environment";
import { signInWithSocialProvider, SocialAuthCancelledError, SocialProvider, socialProviders } from "@/services/socialAuth";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";
import { postAuthRouteForUser } from "@/utils/authRouting";

export default function LoginScreen() {
  const { t } = useTranslation();
  useDocumentTitle("POP");
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => signInWithEmail(email.trim(), password),
    onSuccess: (user) => {
      router.replace(postAuthRouteForUser(user));
    },
    onError: (err) => setError(err instanceof Error ? err.message : t("unableToLoginPleaseCheck"))
  });

  const socialMutation = useMutation({
    mutationFn: (provider: SocialProvider) => signInWithSocialProvider(provider),
    onError: (err) => {
      if (err instanceof SocialAuthCancelledError) return;
      setError(t(err instanceof Error ? err.message : "socialSetupRequired"));
    }
  });

  const submit = () => {
    setError(null);
    loginMutation.mutate();
  };

  return (
    <AppScreen scroll padded={false}>
      <View style={styles.hero}>
        <Text style={styles.logo}>POP!</Text>
        <Text style={styles.environmentTitle}>{pageTitle("POP")}</Text>
        <Text style={styles.welcome}>{t("welcome")}</Text>
        <Text style={styles.subtitle}>{t("appSubtitle")}</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{t("emailLogin")}</Text>
        <FormField
          label={t("loginIdentifier")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("yourLoginIdentifier")}
          icon={<UserRound color={colors.primary} size={18} />}
          error={error}
        />
        <FormField
          label={t("password")}
          value={password}
          onChangeText={setPassword}
          placeholder={t("password")}
          secureTextEntry
          icon={<LockKeyhole color={colors.primary} size={18} />}
        />
        <AppButton label={t("ok")} loading={loginMutation.isPending} onPress={submit} />
        <View style={styles.links}>
          <Pressable onPress={() => router.push("/forgot-password")}>
            <Text style={styles.link}>{t("forgotPassword")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.link}>{t("createAccount")}</Text>
          </Pressable>
        </View>
        <Text style={styles.socialTitle}>{t("connectWith")}</Text>
        <View style={styles.socialRow}>
          {socialProviders.map((provider) => (
            <Pressable
              key={provider.id}
              accessibilityLabel={`${t("connectWith")} ${provider.label}`}
              disabled={socialMutation.isPending}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
                socialMutation.isPending && styles.socialButtonDisabled
              ]}
              onPress={() => socialMutation.mutate(provider.id)}
            >
              <SocialProviderIcon provider={provider.id} />
            </Pressable>
          ))}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingTop: 44,
    paddingBottom: 36,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: spacing.lg,
    borderBottomRightRadius: spacing.lg
  },
  logo: {
    color: "#fff",
    fontFamily: fontFamilies.display,
    fontSize: 56,
    lineHeight: 58,
    fontWeight: fontWeights.black,
    letterSpacing: 0
  },
  welcome: {
    fontFamily: fontFamilies.display,
    color: "#fff",
    fontSize: typography.h1,
    lineHeight: 32,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.lg
  },
  environmentTitle: {
    fontFamily: fontFamilies.sans,
    color: "#fff",
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold,
    opacity: 0.86,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    color: "#fff",
    textAlign: "center",
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 21,
    opacity: 0.88
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface
  },
  sectionTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: fontWeights.semibold,
    textAlign: "center"
  },
  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  link: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.semibold
  },
  socialTitle: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    textAlign: "center",
    fontWeight: fontWeights.medium
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  socialButtonPressed: {
    opacity: 0.78
  },
  socialButtonDisabled: {
    opacity: 0.56
  }
});
