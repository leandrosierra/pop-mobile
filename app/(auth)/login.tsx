import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Apple, Mail, MessageCircle, Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { canShowProvider, signInWithSocialProvider, SocialProvider } from "@/services/socialAuth";
import { useAuthStore } from "@/store/authStore";
import { colors, spacing } from "@/theme";

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
        <View style={styles.field}>
          <Mail color={colors.primary} size={18} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t("yourEmailAddress")}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("password")}
            secureTextEntry
            style={styles.input}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    paddingTop: spacing.xl,
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
    fontWeight: "900"
  },
  subtitle: {
    color: "#fff",
    textAlign: "center",
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 22
  },
  form: {
    padding: spacing.lg,
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.text
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  }
});
