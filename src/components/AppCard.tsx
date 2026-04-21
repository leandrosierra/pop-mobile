import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "@/theme";

type AppCardProps = {
  children: ReactNode;
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, raised = false, style }: AppCardProps) {
  return <View style={[styles.root, raised && styles.raised, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.xs
  },
  raised: {
    borderColor: "transparent",
    ...shadows.md
  }
});
