import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLink, Landmark, Scale, WalletCards } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SelectField, SelectOption } from "@/components/SelectField";
import { popApi } from "@/api/pop";
import { BackendBudget, BackendBudgetImpact, BackendBudgetPoste } from "@/api/backend";
import { LocationType, PopLocation } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type CivicTab = "budget" | "news" | "law";

const budgetLevelByLocationType: Partial<Record<LocationType, string>> = {
  CITY: "VILLE",
  DEPARTMENT: "DEPT",
  REGION: "REGION",
  COUNTRY: "PAYS"
};

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const compactMoney = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")} Md EUR`;
  if (Math.abs(value) >= 1_000_000) return `${Math.round(value / 1_000_000)} M EUR`;
  return money(value);
};

const asNumber = (value: unknown) => Number(value || 0);

const allocationDelta = (poste: BackendBudgetPoste, selectedAmount: number) => {
  const currentAmount = asNumber(poste.montantActuel);
  if (currentAmount <= 0) return 0;
  return ((selectedAmount - currentAmount) * 100) / currentAmount;
};

const resolveImpacts = (budget: BackendBudget | undefined, allocations: Record<number, string>) => {
  if (!budget?.postes?.length) return [];
  return budget.postes.flatMap((poste) => {
    const delta = allocationDelta(poste, asNumber(allocations[poste.id]));
    return (poste.impacts ?? []).filter((impact) => {
      const threshold = Math.abs(asNumber(impact.seuilPourcentage));
      if (impact.sens === "POSITIF") return delta >= threshold;
      if (impact.sens === "NEGATIF") return delta <= -threshold;
      return false;
    });
  });
};

export default function CivicScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CivicTab>("budget");

  return (
    <AppScreen scroll>
      <Header title={t("civic")} create={false} settings={false} />
      <View style={styles.content}>
        <SegmentedControl<CivicTab>
          value={tab}
          segments={[
            { value: "budget", label: t("budget") },
            { value: "news", label: t("news") },
            { value: "law", label: t("law") }
          ]}
          onChange={setTab}
        />
        {tab === "budget" ? <BudgetPanel /> : null}
        {tab === "news" ? <NewsPanel /> : null}
        {tab === "law" ? <LawPanel /> : null}
      </View>
    </AppScreen>
  );
}

function BudgetPanel() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const user = useAuthStore((state) => state.user);
  const [territoryKey, setTerritoryKey] = useState("");
  const [budgetKey, setBudgetKey] = useState("");
  const [allocations, setAllocations] = useState<Record<number, string>>({});

  const territories = useMemo(
    () => (user?.userChoiceGeo ?? []).filter((location) => budgetLevelByLocationType[location.type]),
    [user?.userChoiceGeo]
  );

  const territoryOptions = useMemo<SelectOption<string>[]>(
    () => territories.map((location) => ({
      value: `${location.type}:${location.id}`,
      label: location.label,
      detail: t(`territory${location.type}`)
    })),
    [territories, t]
  );

  useEffect(() => {
    if (!territoryKey && territoryOptions[0]) setTerritoryKey(territoryOptions[0].value);
  }, [territoryKey, territoryOptions]);

  const selectedTerritory = territories.find((location) => `${location.type}:${location.id}` === territoryKey);
  const budgetLevel = selectedTerritory ? budgetLevelByLocationType[selectedTerritory.type] : undefined;

  const budgetsQuery = useQuery({
    queryKey: ["budgets", budgetLevel, selectedTerritory?.id],
    queryFn: () => popApi.budgetsForTerritory(token, String(budgetLevel), String(selectedTerritory?.id)),
    enabled: Boolean(budgetLevel && selectedTerritory?.id)
  });

  const budgetOptions = useMemo<SelectOption<string>[]>(
    () => (budgetsQuery.data ?? []).map((budget) => ({
      value: String(budget.id),
      label: `${budget.libelleTerritoire || selectedTerritory?.label || t("budget")} ${budget.annee || ""}`.trim(),
      detail: compactMoney(asNumber(budget.montantTotal))
    })),
    [budgetsQuery.data, selectedTerritory?.label, t]
  );

  useEffect(() => {
    if (budgetOptions[0] && !budgetOptions.some((option) => option.value === budgetKey)) {
      setBudgetKey(budgetOptions[0].value);
    }
  }, [budgetKey, budgetOptions]);

  const budget = (budgetsQuery.data ?? []).find((item) => String(item.id) === budgetKey) ?? budgetsQuery.data?.[0];

  useEffect(() => {
    if (!budget?.postes?.length) return;
    setAllocations(Object.fromEntries(budget.postes.map((poste) => [poste.id, String(asNumber(poste.montantActuel))])));
  }, [budget?.id]);

  const selectedTotal = useMemo(
    () => Object.values(allocations).reduce((total, value) => total + asNumber(value), 0),
    [allocations]
  );
  const officialTotal = asNumber(budget?.montantTotal);
  const balance = officialTotal - selectedTotal;
  const localImpacts = resolveImpacts(budget, allocations);

  const mutation = useMutation({
    mutationFn: () => popApi.saveBudgetChoice(
      token,
      Number(budget?.id),
      Object.entries(allocations).map(([posteId, montant]) => ({ posteId: Number(posteId), montant: asNumber(montant) }))
    )
  });

  const impacts = mutation.data?.impacts ?? localImpacts;
  const canSave = Boolean(budget?.id && budget.postes?.length);

  return (
    <AppCard style={styles.panel}>
      <View style={styles.headingRow}>
        <WalletCards color={colors.primary} size={18} />
        <Text style={styles.panelTitle}>{t("budgetSimulator")}</Text>
      </View>
      {!territoryOptions.length ? <EmptyState label={t("noBudgetTerritory")} /> : null}
      {territoryOptions.length ? (
        <>
          <SelectField label={t("territory")} value={territoryKey} options={territoryOptions} onChange={setTerritoryKey} />
          {budgetsQuery.isLoading ? <LoadingState label={t("loadingData")} /> : null}
          {budgetsQuery.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
          {!budgetsQuery.isLoading && !budgetsQuery.isError && !budgetOptions.length ? <EmptyState label={t("noBudgetAvailable")} /> : null}
          {budgetOptions.length ? <SelectField label={t("budgetReference")} value={budgetKey} options={budgetOptions} onChange={setBudgetKey} /> : null}
          {budget ? (
            <View style={styles.budgetBox}>
              <View style={styles.budgetSummary}>
                <View>
                  <Text style={styles.metricLabel}>{t("publicBudget")}</Text>
                  <Text style={styles.metricValue}>{compactMoney(officialTotal)}</Text>
                </View>
                <View>
                  <Text style={styles.metricLabel}>{t("yourAllocation")}</Text>
                  <Text style={[styles.metricValue, balance < 0 && styles.negativeText]}>{compactMoney(selectedTotal)}</Text>
                </View>
              </View>
              <Text style={[styles.balance, balance < 0 && styles.negativeText]}>
                {balance >= 0 ? t("remainingBudget", { amount: compactMoney(balance) }) : t("overBudget", { amount: compactMoney(Math.abs(balance)) })}
              </Text>
              <View style={styles.posteList}>
                {(budget.postes ?? []).map((poste) => {
                  const selectedAmount = asNumber(allocations[poste.id]);
                  const delta = allocationDelta(poste, selectedAmount);
                  return (
                    <View key={poste.id} style={styles.posteRow}>
                      <View style={styles.posteText}>
                        <Text style={styles.posteTitle} numberOfLines={1}>{poste.libelle}</Text>
                        <Text style={styles.posteMeta}>
                          {compactMoney(asNumber(poste.montantActuel))} | {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                        </Text>
                      </View>
                      <FormField
                        value={allocations[poste.id] ?? "0"}
                        onChangeText={(value) => setAllocations((current) => ({ ...current, [poste.id]: value.replace(",", ".") }))}
                        keyboardType="numeric"
                        style={styles.amountInput}
                      />
                    </View>
                  );
                })}
              </View>
              <ImpactList impacts={impacts} emptyLabel={t("noBudgetImpact")} />
              <AppButton label={t("saveBudgetChoice")} size="sm" disabled={!canSave} loading={mutation.isPending} onPress={() => mutation.mutate()} />
              {mutation.isError ? <Text style={styles.error}>{t("cannotProcessRequest")}</Text> : null}
            </View>
          ) : null}
        </>
      ) : null}
    </AppCard>
  );
}

function NewsPanel() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const actualitesQuery = useQuery({
    queryKey: ["actualites"],
    queryFn: () => popApi.actualites(token)
  });
  const suggestionsQuery = useQuery({
    queryKey: ["question-suggestions"],
    queryFn: () => popApi.questionSuggestions(token)
  });

  return (
    <AppCard style={styles.panel}>
      <View style={styles.headingRow}>
        <Landmark color={colors.primary} size={18} />
        <Text style={styles.panelTitle}>{t("newsQuestions")}</Text>
      </View>
      {suggestionsQuery.isLoading || actualitesQuery.isLoading ? <LoadingState label={t("loadingData")} /> : null}
      {suggestionsQuery.isError || actualitesQuery.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
      <Text style={styles.sectionTitle}>{t("autoQuestionSuggestions")}</Text>
      <View style={styles.compactList}>
        {(suggestionsQuery.data ?? []).map((suggestion) => (
          <Pressable
            key={suggestion.id}
            style={styles.compactItem}
            onPress={() => suggestion.question?.id ? router.push({ pathname: "/question/[id]", params: { id: String(suggestion.question.id), mode: "detail" } }) : undefined}
          >
            <Text style={styles.itemTitle} numberOfLines={2}>{suggestion.titre}</Text>
            <Text style={styles.itemText} numberOfLines={2}>{suggestion.description}</Text>
            <View style={styles.metaLine}>
              <Chip label={suggestion.statut || t("suggested")} selected />
              {suggestion.actualite?.source ? <Text style={styles.source}>{suggestion.actualite.source}</Text> : null}
            </View>
          </Pressable>
        ))}
        {!suggestionsQuery.isLoading && !suggestionsQuery.isError && !(suggestionsQuery.data ?? []).length ? (
          <EmptyState label={t("noSuggestionAvailable")} />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t("recentNews")}</Text>
      <View style={styles.compactList}>
        {(actualitesQuery.data ?? []).map((actualite) => (
          <View key={actualite.id} style={styles.compactItem}>
            <Text style={styles.itemTitle} numberOfLines={2}>{actualite.titre}</Text>
            <Text style={styles.itemText} numberOfLines={3}>{actualite.resume}</Text>
            <View style={styles.metaLine}>
              {actualite.source ? <Text style={styles.source}>{actualite.source}</Text> : null}
              {actualite.url ? (
                <Pressable style={styles.inlineLink} onPress={() => Linking.openURL(String(actualite.url))}>
                  <ExternalLink color={colors.primary} size={13} />
                  <Text style={styles.inlineLinkText}>{t("source")}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}
        {!actualitesQuery.isLoading && !actualitesQuery.isError && !(actualitesQuery.data ?? []).length ? (
          <EmptyState label={t("noNewsAvailable")} />
        ) : null}
      </View>
    </AppCard>
  );
}

function LawPanel() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const incoherencesQuery = useQuery({
    queryKey: ["law-incoherences"],
    queryFn: () => popApi.lawIncoherences(token)
  });
  const proposalsQuery = useQuery({
    queryKey: ["current-user-law-proposals"],
    queryFn: () => popApi.currentUserLawProposals(token)
  });

  return (
    <AppCard style={styles.panel}>
      <View style={styles.headingRow}>
        <Scale color={colors.primary} size={18} />
        <Text style={styles.panelTitle}>{t("lawLab")}</Text>
      </View>
      {incoherencesQuery.isLoading || proposalsQuery.isLoading ? <LoadingState label={t("loadingData")} /> : null}
      {incoherencesQuery.isError || proposalsQuery.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
      <Text style={styles.sectionTitle}>{t("lawIncoherences")}</Text>
      <View style={styles.compactList}>
        {(incoherencesQuery.data ?? []).map((incoherence) => (
          <View key={incoherence.id} style={styles.compactItem}>
            <Text style={styles.itemTitle} numberOfLines={2}>{incoherence.loi?.titre || incoherence.loi?.code || t("law")}</Text>
            <Text style={styles.itemText}>{incoherence.description}</Text>
            {incoherence.correctionProposee ? (
              <View style={styles.correctionBox}>
                <Text style={styles.correctionLabel}>{t("proposedCorrection")}</Text>
                <Text style={styles.itemText}>{incoherence.correctionProposee}</Text>
              </View>
            ) : null}
          </View>
        ))}
        {!incoherencesQuery.isLoading && !incoherencesQuery.isError && !(incoherencesQuery.data ?? []).length ? (
          <EmptyState label={t("noLawIncoherence")} />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t("myLawProposals")}</Text>
      <View style={styles.compactList}>
        {(proposalsQuery.data ?? []).map((proposal) => (
          <Pressable
            key={proposal.id}
            style={styles.compactItem}
            onPress={() => proposal.question?.id ? router.push({ pathname: "/question/[id]", params: { id: String(proposal.question.id), mode: "law" } }) : undefined}
          >
            <Text style={styles.itemTitle} numberOfLines={2}>{proposal.titre}</Text>
            <Text style={styles.itemText} numberOfLines={2}>{proposal.exposeMotifs}</Text>
            <View style={styles.metaLine}>
              <Chip label={proposal.statut || "BROUILLON"} selected />
              {proposal.question?.libelle ? <Text style={styles.source} numberOfLines={1}>{proposal.question.libelle}</Text> : null}
            </View>
          </Pressable>
        ))}
        {!proposalsQuery.isLoading && !proposalsQuery.isError && !(proposalsQuery.data ?? []).length ? (
          <EmptyState label={t("noMyLawProposal")} />
        ) : null}
      </View>
    </AppCard>
  );
}

function ImpactList({ impacts, emptyLabel }: { impacts: BackendBudgetImpact[]; emptyLabel: string }) {
  const { t } = useTranslation();
  if (!impacts.length) return <Text style={styles.helper}>{emptyLabel}</Text>;
  return (
    <View style={styles.impactList}>
      {impacts.map((impact) => {
        const positive = impact.sens === "POSITIF";
        return (
          <View key={impact.id} style={[styles.impactItem, positive ? styles.impactPositive : styles.impactNegative]}>
            <Text style={[styles.impactSense, positive ? styles.positiveText : styles.negativeText]}>
              {positive ? t("positiveImpact") : t("negativeImpact")}
            </Text>
            <Text style={styles.itemTitle}>{impact.libelle}</Text>
            {impact.description ? <Text style={styles.itemText}>{impact.description}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm
  },
  panel: {
    gap: spacing.sm
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  panelTitle: {
    color: colors.primaryDark,
    fontFamily: fontFamilies.display,
    fontSize: typography.subtitle,
    lineHeight: 23,
    fontWeight: fontWeights.semibold
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.xs
  },
  budgetBox: {
    gap: spacing.sm
  },
  budgetSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase"
  },
  metricValue: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    fontWeight: fontWeights.bold
  },
  balance: {
    color: colors.success,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  posteList: {
    gap: spacing.xs
  },
  posteRow: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm
  },
  posteText: {
    flex: 1,
    minWidth: 0
  },
  posteTitle: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  posteMeta: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    marginTop: 2
  },
  amountInput: {
    minWidth: 86,
    textAlign: "right"
  },
  compactList: {
    gap: spacing.xs
  },
  compactItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    padding: spacing.sm
  },
  itemTitle: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold
  },
  itemText: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    lineHeight: 17
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  source: {
    flex: 1,
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.medium
  },
  inlineLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  inlineLinkText: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  correctionBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    paddingLeft: spacing.sm
  },
  correctionLabel: {
    color: colors.warning,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase"
  },
  impactList: {
    gap: spacing.xs
  },
  impactItem: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 2
  },
  impactPositive: {
    backgroundColor: colors.greenSoft
  },
  impactNegative: {
    backgroundColor: colors.dangerSoft
  },
  impactSense: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase"
  },
  positiveText: {
    color: colors.success
  },
  negativeText: {
    color: colors.danger
  },
  helper: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  }
});
