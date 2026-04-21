import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { useAuthStore } from "@/store/authStore";
import { colors, spacing } from "@/theme";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      Alert.alert(t("requestSuccess"), t("questionStatusUpdatedSuccessfully"), [
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
      <Header title={t("admin")} back create={false} />
      <View style={styles.content}>
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
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.md
  },
  title: {
    color: colors.primary,
    fontSize: 26,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "900"
  },
  description: {
    color: colors.text,
    lineHeight: 23
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md
  }
});
