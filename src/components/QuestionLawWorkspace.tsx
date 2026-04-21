import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Scale } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { popApi } from "@/api/pop";
import { AppButton } from "@/components/AppButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { PaginationControls } from "@/components/PaginationControls";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type QuestionLawWorkspaceProps = {
  questionId: number;
  questionTitle: string;
  questionDescription: string;
  token: string;
};

export function QuestionLawWorkspace({ questionId, questionTitle, questionDescription, token }: QuestionLawWorkspaceProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState(questionTitle);
  const [exposeMotifs, setExposeMotifs] = useState(questionDescription);
  const [dispositif, setDispositif] = useState("");
  const [analyseConformite, setAnalyseConformite] = useState("");
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ["question-law-proposals", questionId, page],
    queryFn: () => popApi.questionLawProposalsPage(token, questionId, page)
  });

  const mutation = useMutation({
    mutationFn: () => popApi.createLawProposal(token, questionId, {
      titre: titre.trim(),
      exposeMotifs: exposeMotifs.trim(),
      dispositif: dispositif.trim(),
      analyseConformite: analyseConformite.trim()
    }),
    onSuccess: () => {
      setDispositif("");
      setAnalyseConformite("");
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["question-law-proposals", questionId] });
    }
  });

  const proposals = query.data?.content ?? [];
  const canSubmit = titre.trim().length >= 3 && exposeMotifs.trim().length >= 10 && dispositif.trim().length >= 10 && analyseConformite.trim().length >= 10;

  return (
    <View style={styles.root}>
      <View style={styles.form}>
        <View style={styles.headingRow}>
          <Scale color={colors.primary} size={18} />
          <Text style={styles.sectionTitle}>{t("lawDraftWorkspace")}</Text>
        </View>
        <FormField label={t("lawProposalTitle")} value={titre} onChangeText={setTitre} placeholder={t("lawProposalTitle")} />
        <FormField label={t("statementOfReasons")} value={exposeMotifs} onChangeText={setExposeMotifs} placeholder={t("statementOfReasonsPlaceholder")} multiline />
        <FormField label={t("legalText")} value={dispositif} onChangeText={setDispositif} placeholder={t("legalTextPlaceholder")} multiline />
        <FormField label={t("constitutionalityCheck")} value={analyseConformite} onChangeText={setAnalyseConformite} placeholder={t("constitutionalityCheckPlaceholder")} multiline />
        <AppButton label={t("publishLawProposal")} size="sm" disabled={!canSubmit} loading={mutation.isPending} onPress={() => mutation.mutate()} />
        {mutation.isError ? <Text style={styles.error}>{t("cannotProcessRequest")}</Text> : null}
      </View>

      {query.isLoading ? <LoadingState label={t("loadingData")} /> : null}
      {query.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
      {!query.isLoading && !query.isError && !proposals.length ? <EmptyState label={t("noLawProposalYet")} /> : null}

      <View style={styles.list}>
        {proposals.map((proposal) => (
          <View key={proposal.id} style={styles.proposal}>
            <View style={styles.proposalHeader}>
              <Text style={styles.proposalTitle} numberOfLines={2}>{proposal.titre}</Text>
              <Text style={styles.status}>{proposal.statut || "BROUILLON"}</Text>
            </View>
            {proposal.exposeMotifs ? <Text style={styles.bodyText}>{proposal.exposeMotifs}</Text> : null}
            {proposal.dispositif ? (
              <View style={styles.legalBox}>
                <Text style={styles.legalLabel}>{t("legalText")}</Text>
                <Text style={styles.bodyText}>{proposal.dispositif}</Text>
              </View>
            ) : null}
            {proposal.analyseConformite ? (
              <View style={styles.conformityBox}>
                <Text style={styles.legalLabel}>{t("constitutionalityCheck")}</Text>
                <Text style={styles.bodyText}>{proposal.analyseConformite}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
      <PaginationControls
        page={page}
        totalPages={query.data?.totalPages}
        totalElements={query.data?.totalElements}
        disabled={query.isFetching}
        onPageChange={setPage}
      />
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
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    fontWeight: fontWeights.semibold
  },
  list: {
    gap: spacing.xs
  },
  proposal: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    padding: spacing.sm
  },
  proposalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  proposalTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold
  },
  status: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold
  },
  legalBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.sm
  },
  conformityBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    paddingLeft: spacing.sm
  },
  legalLabel: {
    color: colors.primaryDark,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase"
  },
  bodyText: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  }
});
