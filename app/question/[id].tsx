import { useLocalSearchParams, router } from "expo-router";
import { Share, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultBars } from "@/components/ResultBars";
import { popApi } from "@/api/pop";
import { PopQuestion } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { cardColors, colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

type Mode = "detail" | "stats" | "vote";

export default function QuestionScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string; mode?: Mode }>();
  const id = Number(params.id);
  const mode = params.mode ?? "detail";
  const token = useAuthStore((state) => state.requireToken());

  const query = useQuery({
    queryKey: ["question", id],
    queryFn: () => popApi.getQuestion(token, id),
    enabled: Number.isFinite(id)
  });

  const answerMutation = useMutation({
    mutationFn: (responseType: "YES" | "NO" | "NEUTRAL") => popApi.answerQuestion(token, id, responseType, "PUT"),
    onSuccess: (result) => {
      if (result.queued) router.replace("/home");
      else router.replace({ pathname: "/question/[id]", params: { id: String(id), mode: "stats" } });
    }
  });

  if (query.isLoading) return <LoadingState label={t("loadingData")} />;
  if (query.isError || !query.data) return <ErrorState label={t("errorFetchingQuestionResult")} />;

  const detail = query.data;
  const question: PopQuestion = {
    id: detail.id,
    questionTitle: detail.questionTitle,
    questionDesc: detail.questionDesc,
    creator: "",
    status: "",
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt
  };

  if (mode === "vote") {
    return (
      <AppScreen padded={false}>
        <Header back create={false} settings={false} homeLink={false} />
        <View style={styles.cardContent}>
          <QuestionCard
            question={question}
            color={cardColors[id % cardColors.length]}
            onAnswer={(answer) => answerMutation.mutate(answer)}
            onMoreInfo={() => router.setParams({ mode: "detail" })}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <Header back settings={false} homeLink={false} />
      <AppCard style={styles.content}>
        <Text style={styles.title}>{detail.questionTitle}</Text>
        {mode === "detail" ? <Text style={styles.description}>{detail.questionDesc}</Text> : null}
        <View style={styles.tags}>
          {detail.geoTags.map((geo) => <Chip key={`${geo.type}-${geo.id}`} label={geo.label} />)}
          {detail.interestTags.map((interest) => <Chip key={interest.code} label={interest.label} />)}
        </View>
        {mode === "stats" ? <ResultBars stats={detail.stats} /> : null}
        <View style={styles.actions}>
          {mode === "detail" ? (
            <AppButton label={t("ok")} onPress={() => router.back()} />
          ) : (
            <AppButton label={t("ok")} onPress={() => router.replace("/home")} />
          )}
          <AppButton
            label={t("shareToFriends")}
            variant="secondary"
            onPress={() => Share.share({ message: `POP: ${detail.questionTitle}` })}
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flex: 1,
    padding: spacing.sm
  },
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
