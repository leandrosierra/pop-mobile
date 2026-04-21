import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

const emailSchema = z.string().email();
const nameSchema = z.string().min(3).max(16).regex(/^[\p{L}\p{N} ]+$/u);

export default function SignupScreen() {
  const { t } = useTranslation();
  const createEmailAccount = useAuthStore((state) => state.createEmailAccount);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createEmailAccount(name.trim(), email.trim()),
    onSuccess: () => {
      Alert.alert(t("accountCreatedSuccessTitle"), `${t("accountCreatedSuccessBody")}\n${t("youWillReceiveMail")}`, [
        { text: t("ok"), onPress: () => router.back() }
      ]);
    },
    onError: (err) => setError(err instanceof Error ? err.message : t("cannotProcessRequest"))
  });

  const submit = () => {
    setError(null);
    if (!nameSchema.safeParse(name.trim()).success) {
      setError(t("nameShouldBeOfLength"));
      return;
    }
    if (!emailSchema.safeParse(email.trim()).success) {
      setError(t("enterValidEmailId"));
      return;
    }
    if (email.trim() !== confirmEmail.trim()) {
      setError(t("emailIdMistaching"));
      return;
    }
    mutation.mutate();
  };

  return (
    <AppScreen scroll>
      <Header back create={false} settings={false} homeLink={false} />
      <AppCard style={styles.form}>
        <Text style={styles.title}>{t("createAccount")}</Text>
        <FormField label={t("yourName")} value={name} onChangeText={setName} placeholder={t("yourName")} />
        <FormField value={email} onChangeText={setEmail} label={t("yourEmailAddress")} placeholder={t("yourEmailAddress")} autoCapitalize="none" keyboardType="email-address" />
        <FormField value={confirmEmail} onChangeText={setConfirmEmail} label={t("confirmEmailId")} placeholder={t("confirmEmailId")} autoCapitalize="none" keyboardType="email-address" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label={t("createAccount")} loading={mutation.isPending} onPress={submit} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.subtitle,
    fontWeight: fontWeights.semibold
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.semibold
  }
});
