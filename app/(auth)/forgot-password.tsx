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

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email.trim()),
    onSuccess: () => {
      Alert.alert(t("requestSuccess"), t("youWillReceiveMail"), [
        { text: t("ok"), onPress: () => router.back() }
      ]);
    },
    onError: (err) => setError(err instanceof Error ? err.message : t("cannotProcessRequest"))
  });

  const submit = () => {
    setError(null);
    if (!emailSchema.safeParse(email.trim()).success) {
      setError(t("enterValidEmailId"));
      return;
    }
    mutation.mutate();
  };

  return (
    <AppScreen scroll>
      <Header back create={false} settings={false} />
      <View style={styles.form}>
        <Text style={styles.title}>{t("forgotPassword")}</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder={t("yourEmailAddress")} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label={t("resetPassword")} loading={mutation.isPending} onPress={submit} />
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
