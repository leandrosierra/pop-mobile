import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

type AdminStatus = "ACTIVE" | "DRAFT" | "IDLE";

export default function AdminQuestionScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string; status?: AdminStatus }>();
  const id = Number(params.id);
  const token = useAuthStore((state) => state.requireToken());
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["question", id],
    queryFn: () => popApi.getQuestion(token, id)
  });

  const statusMutation = useMutation({
    mutationFn: (status: AdminStatus) => popApi.setQuestionStatus(token, id, status),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      Alert.alert(t("requestSuccess"), result.queued ? t("offlineChangeSaved") : t("questionStatusUpdatedSuccessfully"), [
        { text: t("ok"), onPress: () => router.back() }
      ]);
    },
    onError: (err) => Alert.alert(t("cannotProcessRequest"), err instanceof Error ? err.message : t("cannotProcessRequest"))
  });

  if (query.isLoading) return <LoadingState label={t("loadingData")} />;
  if (query.isError || !query.data) return <ErrorState label={t("dataAccessProblem")} />;

  const detail = query.data;

  return (
    <AppScreen scroll>
      <Header title={t("admin")} back create={false} settings={false} homeLink={false} />
      <AppCard style={styles.content}>
        <Text style={styles.title}>{detail.questionTitle}</Text>
        <Text style={styles.description}>{detail.questionDesc}</Text>
        <View style={styles.tags}>
          {detail.geoTags.map((geo) => <Chip key={`${geo.type}-${geo.id}`} label={geo.label} />)}
          {detail.interestTags.map((interest) => <Chip key={interest.code} label={interest.label} />)}
        </View>
        <View style={styles.actions}>
          <AppButton label={t("toValidate")} loading={statusMutation.isPending} onPress={() => statusMutation.mutate("ACTIVE")} />
          <AppButton label={t("flip")} variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate("DRAFT")} />
          <AppButton label={t("toRefuse")} variant="danger" loading={statusMutation.isPending} onPress={() => statusMutation.mutate("IDLE")} />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.subtitle,
    lineHeight: 24,
    fontWeight: fontWeights.semibold
  },
  description: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 20
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm
  }
});
