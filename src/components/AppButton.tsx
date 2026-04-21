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
import { colors, spacing } from "@/theme";

type AppButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  icon,
  variant = "primary",
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
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : colors.primary} />
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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  label: {
    fontSize: 15,
    fontWeight: "700"
  },
  primary: {
    backgroundColor: colors.primary
  },
  primaryLabel: {
    color: "#fff"
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryLabel: {
    color: colors.primary
  },
  danger: {
    backgroundColor: colors.danger
  },
  dangerLabel: {
    color: "#fff"
  },
  ghost: {
    backgroundColor: "transparent"
  },
  ghostLabel: {
    color: colors.primary
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.82
  }
});
