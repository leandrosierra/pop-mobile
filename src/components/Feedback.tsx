import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

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
      <Text style={styles.title}>{label}</Text>
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
    fontSize: 18,
    fontWeight: "800"
  },
  text: {
    color: colors.muted,
    textAlign: "center"
  },
  error: {
    color: colors.danger
  }
});
