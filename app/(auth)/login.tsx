import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Apple, LockKeyhole, MessageCircle, Search, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { FormField } from "@/components/FormField";
import { canShowProvider, signInWithSocialProvider, SocialProvider } from "@/services/socialAuth";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, shadows, spacing, typography } from "@/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => signInWithEmail(email.trim(), password),
    onSuccess: (user) => {
      if (!user.userChoiceGeo.length) router.replace("/setup/geography");
      else if (!user.userInterest.length) router.replace("/setup/interests");
      else router.replace("/home");
    },
    onError: (err) => setError(err instanceof Error ? err.message : t("unableToLoginPleaseCheck"))
  });

  const socialMutation = useMutation({
    mutationFn: (provider: SocialProvider) => signInWithSocialProvider(provider),
    onError: (err) => setError(t(err instanceof Error ? err.message : "socialSetupRequired"))
  });

  const submit = () => {
    setError(null);
    loginMutation.mutate();
  };

  return (
    <AppScreen scroll padded={false}>
      <View style={styles.hero}>
        <Image source={require("../../assets/images/Logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.welcome}>{t("welcome")}</Text>
        <Text style={styles.subtitle}>Proposez la politique que vous souhaitez en votant et lançant vos référendums.</Text>
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
          <Pressable style={styles.socialButton} onPress={() => socialMutation.mutate("google")}>
            <Search color={colors.primary} size={24} />
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => socialMutation.mutate("facebook")}>
            <MessageCircle color={colors.primary} size={24} />
          </Pressable>
          <AppleProviderButton onPress={() => socialMutation.mutate("apple")} />
        </View>
      </View>
    </AppScreen>
  );
}

function AppleProviderButton({ onPress }: { onPress: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    canShowProvider("apple").then(setVisible);
  }, []);
  if (!visible) return null;
  return (
    <Pressable style={styles.socialButton} onPress={onPress}>
      <Apple color={colors.primary} size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg
  },
  logo: {
    width: 150,
    height: 120
  },
  welcome: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: "#fff",
    textAlign: "center",
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 22
  },
  form: {
    margin: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sm
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "900",
    textAlign: "center"
  },
  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  link: {
    color: colors.primary,
    fontWeight: "800"
  },
  socialTitle: {
    color: colors.muted,
    textAlign: "center",
    fontWeight: "700"
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
  }
});
