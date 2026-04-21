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
      <Header back create={false} settings={false} homeLink={false} />
      <AppCard style={styles.form}>
        <Text style={styles.title}>{t("forgotPassword")}</Text>
        <FormField
          label={t("yourEmailAddress")}
          value={email}
          onChangeText={setEmail}
          placeholder={t("yourEmailAddress")}
          autoCapitalize="none"
          keyboardType="email-address"
          error={error}
        />
        <AppButton label={t("resetPassword")} loading={mutation.isPending} onPress={submit} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: fontWeights.semibold
  }
});
