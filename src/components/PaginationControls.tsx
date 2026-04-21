import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

type PaginationControlsProps = {
  page: number;
  totalPages?: number;
  totalElements?: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ page, totalPages = 0, totalElements = 0, disabled, onPageChange }: PaginationControlsProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <View style={styles.root}>
      <AppButton
        label={t("previousPage")}
        size="sm"
        variant="secondary"
        disabled={disabled || page <= 0}
        onPress={() => onPageChange(Math.max(0, page - 1))}
      />
      <Text style={styles.status}>
        {t("pageStatus", { current: page + 1, total: totalPages, count: totalElements })}
      </Text>
      <AppButton
        label={t("nextPage")}
        size="sm"
        variant="secondary"
        disabled={disabled || page >= totalPages - 1}
        onPress={() => onPageChange(Math.min(totalPages - 1, page + 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  status: {
    flex: 1,
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textAlign: "center"
  }
});
