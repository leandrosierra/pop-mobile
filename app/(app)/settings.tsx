import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { isApiNetworkError } from "@/api/client";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { supportedLanguages, SupportedLanguageCode } from "@/localization/languages";
import { useAuthStore } from "@/store/authStore";
import { useOfflineStore } from "@/store/offlineStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const cachedUser = useAuthStore((state) => state.user);
  const removeUserGeoChoice = useAuthStore((state) => state.removeUserGeoChoice);
  const removeUserInterestChoice = useAuthStore((state) => state.removeUserInterestChoice);
  const updateLanguage = useAuthStore((state) => state.updateLanguage);
  const online = useOfflineStore((state) => state.online);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: refreshCurrentUser
  });

  const removeGeoMutation = useMutation({
    mutationFn: (id: string) => {
      const location = (userQuery.data ?? useAuthStore.getState().user)?.userChoiceGeo.find((item) => item.id === id);
      if (!location) throw new Error(t("dataAccessProblem"));
      return popApi.removeGeoLocation(token, location);
    },
    onSuccess: (result, id) => {
      if (result.queued) {
        removeUserGeoChoice(id);
        queryClient.setQueryData(["current-user"], useAuthStore.getState().user);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    }
  });

  const removeInterestMutation = useMutation({
    mutationFn: (code: string) => popApi.removeInterest(token, code),
    onSuccess: (result, code) => {
      if (result.queued) {
        removeUserInterestChoice(code);
        queryClient.setQueryData(["current-user"], useAuthStore.getState().user);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    }
  });

  const passwordMutation = useMutation({
    mutationFn: () => popApi.changePassword(token, password),
    onSuccess: () => {
      setPassword("");
      setConfirmPassword("");
      Alert.alert(t("requestSuccess"), t("passwordUpdatedSuccess"));
    },
    onError: (err) => {
      const error = err as unknown;
      if (isApiNetworkError(error)) return;
      Alert.alert(t("cannotProcessRequest"), error instanceof Error ? error.message : t("dataAccessProblem"));
    }
  });

  const languageMutation = useMutation({
    mutationFn: (language: SupportedLanguageCode) => updateLanguage(language),
    onSuccess: () => {
      queryClient.setQueryData(["current-user"], useAuthStore.getState().user);
      Alert.alert(t("requestSuccess"), online ? t("languageSaved") : t("queuedLanguageChange"));
    },
    onError: (err) => Alert.alert(t("languageUpdateError"), err instanceof Error ? err.message : t("cannotProcessRequest"))
  });

  if (userQuery.isLoading && !cachedUser) return <LoadingState label={t("loadingUserProfile")} />;
  if ((userQuery.isError || !userQuery.data) && !cachedUser) return <ErrorState label={t("errorLoadingUserInfo")} />;

  const user = userQuery.data ?? cachedUser;
  if (!user) return <ErrorState label={t("errorLoadingUserInfo")} />;
  const canChangePassword = password.length > 0 && password === confirmPassword;
  const isAdminUser = user.role.toUpperCase() === "ADMIN";

  return (
    <AppScreen scroll>
      <Header title={t("settings")} create={false} settings={false} />
      <AppCard style={styles.profile}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </AppCard>

      <AppCard style={styles.languageBox}>
        <Text style={styles.section}>{t("interfaceLanguage")}</Text>
        <Text style={styles.helper}>{t("profileLanguageHelp")}</Text>
        <View style={styles.languageGrid}>
          {supportedLanguages.map((language) => {
            const active = language.code === user.language;
            return (
              <Pressable
                key={language.code}
                disabled={languageMutation.isPending}
                onPress={() => languageMutation.mutate(language.code)}
                style={({ pressed }) => [
                  styles.languageOption,
                  active && styles.languageOptionActive,
                  pressed && styles.languageOptionPressed
                ]}
              >
                <Text style={[styles.languageName, active && styles.languageNameActive]}>{language.nativeName}</Text>
                <Text style={[styles.languageRegion, active && styles.languageRegionActive]} numberOfLines={1}>
                  {language.regionName}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
        {!online ? <Text style={styles.helper}>{t("onlineOnlyAction")}</Text> : null}
        <AppButton
          label={t("resetPassword")}
          icon={<KeyRound color="#fff" size={18} />}
          disabled={!canChangePassword || !online}
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
        {!isAdminUser ? (
          <AppButton
            label={t("deleteAccount")}
            variant="danger"
            icon={<Trash2 color="#fff" size={18} />}
            disabled={!online}
            onPress={() =>
              Alert.alert(t("deleteAccount"), t("deleteAccount"), [
                { text: t("cancel"), style: "cancel" },
                {
                  text: t("ok"),
                  style: "destructive",
                  onPress: () => deleteAccount().then(() => router.replace("/login")).catch((err) => {
                    if (!isApiNetworkError(err)) Alert.alert(t("cannotProcessRequest"), err instanceof Error ? err.message : t("dataAccessProblem"));
                  })
                }
              ])
            }
          />
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profile: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  languageBox: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  languageOption: {
    width: "48%",
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: "center"
  },
  languageOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  languageOptionPressed: {
    opacity: 0.84
  },
  languageName: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  languageNameActive: {
    color: colors.primaryDark
  },
  languageRegion: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    marginTop: 2
  },
  languageRegionActive: {
    color: colors.primary
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
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.semibold
  },
  helper: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.medium
  },
  actions: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl
  }
});
