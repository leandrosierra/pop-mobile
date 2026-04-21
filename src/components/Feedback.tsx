import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "@/theme";

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
  return (
    <View style={styles.root}>
      <Text style={[styles.title, styles.error]}>{label}</Text>
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
    color: colors.text,
    textAlign: "center",
    fontSize: typography.subtitle,
    lineHeight: 24,
    fontWeight: "800"
  },
  text: {
    color: colors.muted,
    textAlign: "center",
    fontWeight: "700"
  },
  error: {
    color: colors.danger
  },
  panel: {
    width: "100%",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.sm
  }
});
