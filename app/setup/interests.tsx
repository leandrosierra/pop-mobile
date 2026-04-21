import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { PopInterest } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

export default function InterestSetupScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const setUserInterests = useAuthStore((state) => state.setUserInterests);
  const [selected, setSelected] = useState<PopInterest[]>([]);

  const interestsQuery = useQuery({
    queryKey: ["interests"],
    queryFn: () => popApi.getInterests()
  });

  const saveMutation = useMutation({
    mutationFn: () => popApi.saveInterests(token, selected),
    onSuccess: async (result) => {
      if (result.queued) {
        setUserInterests(selected);
        queryClient.setQueryData(["current-user"], useAuthStore.getState().user);
        router.replace("/home");
        return;
      }

      await refreshCurrentUser();
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.replace("/home");
    }
  });

  const toggleInterest = (interest: PopInterest) => {
    setSelected((current) =>
      current.some((item) => item.code === interest.code)
        ? current.filter((item) => item.code !== interest.code)
        : [...current, interest]
    );
  };

  return (
    <AppScreen scroll>
      <Header title={t("interests")} back create={false} settings={false} homeLink={false} />
      <AppCard style={styles.content}>
        <Text style={styles.title}>{t("selectInterest")}</Text>
        <View style={styles.actions}>
          <AppButton label={t("selectAll")} variant="secondary" onPress={() => setSelected(interestsQuery.data ?? [])} />
        </View>
        <View style={styles.chipWrap}>
          {(interestsQuery.data ?? []).map((interest) => (
            <Chip
              key={interest.code}
              label={interest.label}
              selected={selected.some((item) => item.code === interest.code)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
        </View>
        {saveMutation.isError ? <Text style={styles.error}>{saveMutation.error instanceof Error ? saveMutation.error.message : t("cannotProcessRequest")}</Text> : null}
        <AppButton label={t("save")} disabled={!selected.length} loading={saveMutation.isPending} onPress={() => saveMutation.mutate()} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 420,
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
  },
  actions: {
    alignItems: "flex-start"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  }
});
