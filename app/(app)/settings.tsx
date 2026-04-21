import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: refreshCurrentUser
  });

  const removeGeoMutation = useMutation({
    mutationFn: (id: string) => {
      const location = userQuery.data?.userChoiceGeo.find((item) => item.id === id);
      if (!location) throw new Error(t("dataAccessProblem"));
      return popApi.removeGeoLocation(token, location);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["current-user"] })
  });

  const removeInterestMutation = useMutation({
    mutationFn: (code: string) => popApi.removeInterest(token, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["current-user"] })
  });

  const passwordMutation = useMutation({
    mutationFn: () => popApi.changePassword(token, password),
    onSuccess: () => {
      setPassword("");
      setConfirmPassword("");
      Alert.alert(t("requestSuccess"), t("passwordUpdatedSuccess"));
    },
    onError: (err) => Alert.alert(t("cannotProcessRequest"), err instanceof Error ? err.message : t("dataAccessProblem"))
  });

  if (userQuery.isLoading) return <LoadingState label={t("loadingUserProfile")} />;
  if (userQuery.isError || !userQuery.data) return <ErrorState label={t("errorLoadingUserInfo")} />;

  const user = userQuery.data;
  const canChangePassword = password.length > 0 && password === confirmPassword;

  return (
    <AppScreen scroll>
      <Header title={t("settings")} create={false} settings={false} />
      <AppCard style={styles.profile}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </AppCard>

      <Text style={styles.section}>{t("geographicalLocations")}</Text>
      <View style={styles.chipWrap}>
        {user.userChoiceGeo.map((location) => (
          <Chip key={`${location.type}-${location.id}`} label={location.label} selected onRemove={() => removeGeoMutation.mutate(location.id)} />
        ))}
        <Chip label={t("add")} onPress={() => router.push("/setup/geography")} />
      </View>

      <Text style={styles.section}>{t("interests")}</Text>
      <View style={styles.chipWrap}>
        {user.userInterest.map((interest) => (
          <Chip key={interest.code} label={interest.label} selected onRemove={() => removeInterestMutation.mutate(interest.code)} />
        ))}
        <Chip label={t("add")} onPress={() => router.push("/setup/interests")} />
      </View>

      <AppCard style={styles.passwordBox}>
        <Text style={styles.section}>{t("changeMyPassword")}</Text>
        <FormField value={password} onChangeText={setPassword} placeholder={t("password")} secureTextEntry />
        <FormField value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t("password")} secureTextEntry />
        {password && password !== confirmPassword ? <Text style={styles.error}>{t("passwordMismatching")}</Text> : null}
        <AppButton
          label={t("resetPassword")}
          icon={<KeyRound color="#fff" size={18} />}
          disabled={!canChangePassword}
          loading={passwordMutation.isPending}
          onPress={() => passwordMutation.mutate()}
        />
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          label={t("logout")}
          variant="secondary"
          icon={<LogOut color={colors.primary} size={18} />}
          onPress={() => signOut().then(() => router.replace("/login"))}
        />
        <AppButton
          label={t("deleteAccount")}
          variant="danger"
          icon={<Trash2 color="#fff" size={18} />}
          onPress={() =>
            Alert.alert(t("deleteAccount"), t("deleteAccount"), [
              { text: t("cancel"), style: "cancel" },
              { text: t("ok"), style: "destructive", onPress: () => deleteAccount().then(() => router.replace("/login")) }
            ])
          }
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  name: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.title,
    fontWeight: fontWeights.bold
  },
  email: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    fontWeight: fontWeights.medium
  },
  role: {
    fontFamily: fontFamilies.sans,
    color: colors.primary,
    fontWeight: fontWeights.semibold
  },
  section: {
    fontFamily: fontFamilies.sans,
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.md
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  passwordBox: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.semibold
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl
  }
});
