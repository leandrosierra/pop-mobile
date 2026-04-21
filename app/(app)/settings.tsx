import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { useAuthStore } from "@/store/authStore";
import { colors, spacing } from "@/theme";

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
      <Header title={t("settings")} create={false} />
      <View style={styles.profile}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

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

      <View style={styles.passwordBox}>
        <Text style={styles.section}>{t("changeMyPassword")}</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder={t("password")} secureTextEntry style={styles.input} />
        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t("password")} secureTextEntry style={styles.input} />
        {password && password !== confirmPassword ? <Text style={styles.error}>{t("passwordMismatching")}</Text> : null}
        <AppButton
          label={t("resetPassword")}
          icon={<KeyRound color="#fff" size={18} />}
          disabled={!canChangePassword}
          loading={passwordMutation.isPending}
          onPress={() => passwordMutation.mutate()}
        />
      </View>

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
    paddingVertical: spacing.lg
  },
  name: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900"
  },
  email: {
    color: colors.muted,
    fontWeight: "700"
  },
  role: {
    color: colors.primary,
    fontWeight: "800"
  },
  section: {
    color: colors.primary,
    fontWeight: "900",
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
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl
  }
});
