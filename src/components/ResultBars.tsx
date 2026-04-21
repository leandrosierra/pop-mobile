import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { QuestionStats } from "@/domain/schemas";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type ResultBarsProps = {
  stats: QuestionStats;
};

export function ResultBars({ stats }: ResultBarsProps) {
  const { t } = useTranslation();
  const total = stats.yes + stats.no + stats.neutral;
  const rows = [
    { label: t("no"), value: stats.no, color: colors.danger },
    { label: t("noOpinion"), value: stats.neutral, color: colors.voteNeutral },
    { label: t("yes"), value: stats.yes, color: colors.green }
  ];

  return (
    <View style={styles.root}>
      {rows.map((row) => {
        const percent = total ? Math.round((row.value / total) * 100) : 0;
        return (
          <View key={row.label} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value} ({percent}%)</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${percent}%`, backgroundColor: row.color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  row: {
    gap: spacing.xs
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  label: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  value: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.gray100,
    overflow: "hidden"
  },
  fill: {
    height: "100%"
  }
});
