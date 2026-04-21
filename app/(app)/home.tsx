import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { popApi } from "@/api/pop";
import { PopQuestion } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { cardColors, colors, spacing } from "@/theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const [queue, setQueue] = useState<PopQuestion[]>([]);

  const query = useQuery({
    queryKey: ["question-feed"],
    queryFn: () => popApi.listQuestionFeed(token)
  });

  useEffect(() => {
    if (query.data) setQueue(query.data);
  }, [query.data]);

  const activeQuestion = queue[queue.length - 1];
  const activeColor = useMemo(() => cardColors[queue.length % cardColors.length], [queue.length]);

  const answerMutation = useMutation({
    mutationFn: ({ id, responseType }: { id: number; responseType: "YES" | "NO" | "NEUTRAL" }) =>
      popApi.answerQuestion(token, id, responseType, "POST"),
    onSuccess: (_, variables) => {
      setQueue((current) => current.filter((question) => question.id !== variables.id));
      queryClient.invalidateQueries({ queryKey: ["question-feed"] });
      if (variables.responseType !== "NEUTRAL") {
        router.push({
          pathname: "/question/[id]",
          params: { id: String(variables.id), mode: "stats" }
        });
      }
    }
  });

  return (
    <AppScreen padded={false}>
      <Header />
      <View style={styles.content}>
        {query.isLoading ? <LoadingState label={t("pleaseWaitQuestionArrives")} /> : null}
        {query.isError ? <ErrorState label={t("errorFetchingQuestion")} /> : null}
        {!query.isLoading && !query.isError && !activeQuestion ? (
          <View style={styles.empty}>
            <EmptyState label={t("noMoreQuestions")} />
            <View style={styles.emptyActions}>
              <AppButton label={t("refresh")} variant="secondary" onPress={() => query.refetch()} />
              <AppButton label={t("createNewQuestion")} onPress={() => router.push("/create-question")} />
            </View>
          </View>
        ) : null}
        {activeQuestion ? (
          <>
            {answerMutation.isError ? (
              <Text style={styles.error}>{answerMutation.error instanceof Error ? answerMutation.error.message : t("cannotProcessRequest")}</Text>
            ) : null}
            <QuestionCard
              question={activeQuestion}
              color={activeColor}
              onAnswer={(responseType) => answerMutation.mutate({ id: activeQuestion.id, responseType })}
              onMoreInfo={() =>
                router.push({
                  pathname: "/question/[id]",
                  params: { id: String(activeQuestion.id), mode: "detail" }
                })
              }
            />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md
  },
  empty: {
    flex: 1
  },
  emptyActions: {
    gap: spacing.sm
  },
  error: {
    color: colors.danger,
    fontWeight: "700",
    marginBottom: spacing.sm
  }
});
