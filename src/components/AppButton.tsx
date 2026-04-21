import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  StyleProp,
  Text,
  View,
  ViewStyle
} from "react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type AppButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" || variant === "accent" ? "#fff" : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, styles[`${variant}Label` as const]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    flexShrink: 0
  },
  sm: {
    minHeight: 36,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  md: {},
  lg: {
    minHeight: 52,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  label: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
    textAlign: "center"
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  primaryLabel: {
    color: "#fff"
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  secondaryLabel: {
    color: colors.text
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  dangerLabel: {
    color: "#fff"
  },
  accent: {
    backgroundColor: colors.orange,
    borderColor: colors.orange
  },
  accentLabel: {
    color: "#fff"
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  ghostLabel: {
    color: colors.primary
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }]
  }
});
