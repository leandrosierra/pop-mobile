import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { PopAnsweredQuestion, PopQuestion } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, shadows, spacing, typography } from "@/theme";

type TabName = "authored" | "answered";
type SummaryItem = PopQuestion | PopAnsweredQuestion;

export default function SummaryScreen() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<TabName>("authored");

  const authoredQuery = useQuery({
    queryKey: ["authored-questions"],
    queryFn: () => popApi.userAuthoredQuestions(token)
  });

  const answeredQuery = useQuery({
    queryKey: ["answered-questions"],
    queryFn: () => popApi.userAnsweredQuestions(token)
  });

  const activeQuery = tab === "authored" ? authoredQuery : answeredQuery;
  const data = (activeQuery.data ?? []) as SummaryItem[];

  return (
    <AppScreen padded={false}>
      <Header title={t("summary")} settings={false} />
      <View style={styles.content}>
        <View style={styles.actions}>
          <AppButton label={t("submitReferendum")} onPress={() => router.push("/create-question")} />
          {user?.role === "ADMIN" ? <AppButton label={t("approvals")} variant="secondary" onPress={() => router.push("/admin")} /> : null}
        </View>
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === "authored" && styles.activeTab]} onPress={() => setTab("authored")}>
            <Text style={[styles.tabText, tab === "authored" && styles.activeTabText]}>{t("myQuestion")}</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === "answered" && styles.activeTab]} onPress={() => setTab("answered")}>
            <Text style={[styles.tabText, tab === "answered" && styles.activeTabText]}>{t("myAnswer")}</Text>
          </Pressable>
        </View>
        {activeQuery.isLoading ? <LoadingState label={t("loadingData")} /> : null}
        {activeQuery.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
        {activeQuery.data ? (
          <FlatList<SummaryItem>
            data={data}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.listItem}
                onPress={() =>
                  router.push({
                    pathname: "/question/[id]",
                    params: {
                      id: String(item.id),
                      mode: tab === "authored" ? "stats" : "vote"
                    }
                  })
                }
              >
                <Text style={styles.questionTitle}>{item.questionTitle}</Text>
                {"response" in item ? <Text style={styles.response}>A: {String(item.response)}</Text> : null}
              </Pressable>
            )}
          />
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md
  },
  actions: {
    gap: spacing.sm
  },
  tabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  activeTab: {
    backgroundColor: colors.primary
  },
  tabText: {
    color: colors.primary,
    fontWeight: "800"
  },
  activeTabText: {
    color: "#fff"
  },
  separator: {
    height: spacing.sm
  },
  listItem: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.sm
  },
  questionTitle: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: "800"
  },
  response: {
    color: colors.muted,
    marginTop: spacing.xs
  }
});
