import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { QuestionStats } from "@/domain/schemas";
import { colors, radii, spacing, typography } from "@/theme";

type ResultBarsProps = {
  stats: QuestionStats;
};

export function ResultBars({ stats }: ResultBarsProps) {
  const { t } = useTranslation();
  const total = stats.yes + stats.no + stats.neutral;
  const rows = [
    { label: t("no"), value: stats.no, color: colors.danger },
    { label: t("noOpinion"), value: stats.neutral, color: colors.yellow },
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
    borderRadius: radii.md,
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
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  value: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  track: {
    height: 12,
    borderRadius: radii.sm,
    backgroundColor: "#e6ebf5",
    overflow: "hidden"
  },
  fill: {
    height: "100%"
  }
});
