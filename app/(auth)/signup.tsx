import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, shadows, spacing, typography } from "@/theme";

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
      <View style={styles.form}>
        <Text style={styles.title}>{t("createAccount")}</Text>
        <FormField label={t("yourName")} value={name} onChangeText={setName} placeholder={t("yourName")} />
        <FormField value={email} onChangeText={setEmail} label={t("yourEmailAddress")} placeholder={t("yourEmailAddress")} autoCapitalize="none" keyboardType="email-address" />
        <FormField value={confirmEmail} onChangeText={setConfirmEmail} label={t("confirmEmailId")} placeholder={t("confirmEmailId")} autoCapitalize="none" keyboardType="email-address" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label={t("createAccount")} loading={mutation.isPending} onPress={submit} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.sm
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "900",
    textAlign: "center"
  },
  error: {
    color: colors.danger,
    fontWeight: "800"
  }
});
