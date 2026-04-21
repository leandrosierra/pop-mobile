import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { Header } from "@/components/Header";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TimestampBadge } from "@/components/TimestampBadge";
import { popApi } from "@/api/pop";
import { PopQuestion } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

const statusTabs = ["DRAFT", "ACTIVE", "IDLE"] as const;
type StatusTab = (typeof statusTabs)[number];

export default function AdminQuestionsScreen() {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const [status, setStatus] = useState<StatusTab>("DRAFT");

  const query = useQuery({
    queryKey: ["admin-questions"],
    queryFn: () => popApi.adminQuestions(token)
  });

  const labels: Record<StatusTab, string> = {
    DRAFT: t("draftToValid"),
    ACTIVE: t("valid"),
    IDLE: t("rejected")
  };

  const questions = query.data?.[status] ?? [];

  return (
    <AppScreen padded={false}>
      <Header title={t("admin")} back create={false} settings={false} homeLink={false} />
      <View style={styles.content}>
        <SegmentedControl
          value={status}
          onChange={setStatus}
          segments={statusTabs.map((tab) => ({ value: tab, label: labels[tab] }))}
        />
        {query.isLoading ? <LoadingState label={t("loadingData")} /> : null}
        {query.isError ? <ErrorState label={t("dataAccessProblem")} /> : null}
        {query.data && !questions.length ? <EmptyState label={t("noQuestionAvailable")} /> : null}
        {questions.length ? (
          <FlatList<PopQuestion>
            data={questions}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() =>
                  router.push({
                    pathname: "/admin/[id]",
                    params: { id: String(item.id), status: item.status || status }
                  })
                }
              >
                <View style={styles.itemHeader}>
                  <TimestampBadge value={item.createdAt} locale={i18n.language} />
                </View>
                <Text style={styles.questionTitle} numberOfLines={2}>{item.questionTitle}</Text>
                <Text style={styles.creator} numberOfLines={1}>{item.creator}</Text>
              </Pressable>
            )}
          />
        ) : null}
        <AppButton label={t("refresh")} size="sm" variant="secondary" onPress={() => query.refetch()} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.sm
  },
  listContent: {
    paddingBottom: spacing.sm
  },
  separator: {
    height: spacing.xs
  },
  item: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm
  },
  itemHeader: {
    flexDirection: "row",
    marginBottom: spacing.xs
  },
  questionTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold
  },
  creator: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    fontSize: typography.tiny,
    marginTop: spacing.xs
  }
});
