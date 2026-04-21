import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TimestampBadge } from "@/components/TimestampBadge";
import { popApi } from "@/api/pop";
import { PopAnsweredQuestion, PopQuestion } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, radii, shadows, spacing, typography } from "@/theme";

type TabName = "authored" | "answered";
type SummaryItem = (PopQuestion | PopAnsweredQuestion) & {
  summaryKey?: string;
};

const summaryItemKey = (tab: TabName) => (item: SummaryItem, index: number) => {
  if (item.summaryKey) return item.summaryKey;
  if ("response" in item) return `answered-${item.id}-${item.response}-${index}`;
  return `authored-${item.id}`;
};

export default function SummaryScreen() {
  const { t, i18n } = useTranslation();
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
        <SegmentedControl
          value={tab}
          onChange={setTab}
          segments={[
            { value: "authored", label: t("myQuestion") },
            { value: "answered", label: t("myAnswer") }
          ]}
        />
        {activeQuery.isLoading ? <LoadingState label={t("loadingData")} /> : null}
        {activeQuery.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
        {activeQuery.data ? (
          <FlatList<SummaryItem>
            data={data}
            keyExtractor={summaryItemKey(tab)}
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
                <View style={styles.itemHeader}>
                  <TimestampBadge
                    value={"response" in item ? item.answeredAt || item.createdAt : item.createdAt}
                    locale={i18n.language}
                  />
                </View>
                <Text style={styles.questionTitle}>{item.questionTitle}</Text>
                {"response" in item ? <Text style={styles.response}>{t("answerPrefix")}: {String(item.response)}</Text> : null}
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
  itemHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm
  },
  questionTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: fontWeights.semibold
  },
  response: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    marginTop: spacing.xs
  }
});
