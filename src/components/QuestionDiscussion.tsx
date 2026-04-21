import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Reply } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { popApi } from "@/api/pop";
import { BackendQuestionComment } from "@/api/backend";
import { AppButton } from "@/components/AppButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { TimestampBadge } from "@/components/TimestampBadge";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type QuestionDiscussionProps = {
  questionId: number;
  token: string;
};

export function QuestionDiscussion({ questionId, token }: QuestionDiscussionProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<BackendQuestionComment | null>(null);

  const query = useQuery({
    queryKey: ["question-comments", questionId],
    queryFn: () => popApi.questionComments(token, questionId)
  });

  const mutation = useMutation({
    mutationFn: () => popApi.createQuestionComment(token, questionId, content.trim(), replyTo?.id),
    onSuccess: () => {
      setContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["question-comments", questionId] });
    }
  });

  const comments = query.data ?? [];
  const canSubmit = content.trim().length >= 2;

  return (
    <View style={styles.root}>
      <View style={styles.form}>
        {replyTo ? (
          <View style={styles.replyBox}>
            <Text style={styles.replyLabel} numberOfLines={1}>
              {t("replyTo")} {replyTo.user?.login || t("citizen")}
            </Text>
            <Pressable onPress={() => setReplyTo(null)}>
              <Text style={styles.cancelReply}>{t("cancel")}</Text>
            </Pressable>
          </View>
        ) : null}
        <FormField
          label={t("joinDebate")}
          value={content}
          onChangeText={setContent}
          placeholder={t("commentPlaceholder")}
          multiline
          icon={<MessageCircle color={colors.primary} size={16} />}
        />
        <AppButton
          label={replyTo ? t("reply") : t("publishComment")}
          size="sm"
          disabled={!canSubmit}
          loading={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
        {mutation.isError ? <Text style={styles.error}>{t("cannotProcessRequest")}</Text> : null}
      </View>

      {query.isLoading ? <LoadingState label={t("loadingData")} /> : null}
      {query.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
      {!query.isLoading && !query.isError && !comments.length ? <EmptyState label={t("noCommentsYet")} /> : null}

      <View style={styles.list}>
        {comments.map((comment) => (
          <View key={comment.id} style={[styles.comment, comment.parentComment && styles.childComment]}>
            <View style={styles.commentHeader}>
              <Text style={styles.author} numberOfLines={1}>{comment.user?.login || t("citizen")}</Text>
              <TimestampBadge value={String(comment.dateCreation || comment.dateModification || "")} locale={i18n.language} />
            </View>
            {comment.parentComment ? (
              <Text style={styles.parent} numberOfLines={1}>
                {t("inReplyTo")} {comment.parentComment.user?.login || t("citizen")}
              </Text>
            ) : null}
            <Text style={styles.commentText}>{comment.contenu}</Text>
            <Pressable style={styles.replyAction} onPress={() => setReplyTo(comment)}>
              <Reply color={colors.primary} size={14} />
              <Text style={styles.replyActionText}>{t("reply")}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm
  },
  form: {
    gap: spacing.sm
  },
  replyBox: {
    minHeight: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  replyLabel: {
    flex: 1,
    color: colors.primaryDark,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  cancelReply: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  list: {
    gap: spacing.xs
  },
  comment: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    padding: spacing.sm
  },
  childComment: {
    marginLeft: spacing.md,
    backgroundColor: colors.gray25
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  author: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  parent: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.medium
  },
  commentText: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18
  },
  replyAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  replyActionText: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  }
});
