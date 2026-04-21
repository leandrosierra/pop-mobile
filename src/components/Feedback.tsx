import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOfflineStore } from "@/store/offlineStore";
import { colors, fontFamilies, fontWeights, radii, shadows, spacing, typography } from "@/theme";

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.title}>{label}</Text>
      </View>
    </View>
  );
}

export function ErrorState({ label }: { label: string }) {
  const { t } = useTranslation();
  const offline = useOfflineStore((state) => !state.online);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, !offline && styles.error]}>{offline ? t("offlineDataUnavailable") : label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg
  },
  title: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    textAlign: "center",
    fontSize: typography.subtitle,
    lineHeight: 24,
    fontWeight: fontWeights.semibold
  },
  text: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    textAlign: "center",
    fontWeight: fontWeights.medium
  },
  error: {
    color: colors.danger
  },
  panel: {
    width: "100%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.sm
  }
});
