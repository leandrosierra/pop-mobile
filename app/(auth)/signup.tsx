import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { colors, spacing } from "@/theme";

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
      <Header back create={false} settings={false} />
      <View style={styles.form}>
        <Text style={styles.title}>{t("createAccount")}</Text>
        <TextInput value={name} onChangeText={setName} placeholder={t("yourName")} style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder={t("yourEmailAddress")} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput value={confirmEmail} onChangeText={setConfirmEmail} placeholder={t("confirmEmailId")} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label={t("createAccount")} loading={mutation.isPending} onPress={submit} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
    paddingTop: spacing.xl
  },
  title: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center"
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  }
});
