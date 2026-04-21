import { ReactNode } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme";

type FormFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string | null;
  icon?: ReactNode;
};

export function FormField({ label, helper, error, icon, multiline, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, multiline && styles.multilineShell, error && styles.errorShell]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.subtle}
          style={[styles.input, multiline && styles.multilineInput, style]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  inputShell: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md
  },
  multilineShell: {
    minHeight: 128,
    alignItems: "flex-start",
    paddingVertical: spacing.sm
  },
  errorShell: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft
  },
  icon: {
    marginRight: spacing.sm
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.text,
    fontSize: typography.body,
    outlineStyle: "none" as never
  },
  multilineInput: {
    minHeight: 108,
    textAlignVertical: "top"
  },
  helper: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: "600"
  },
  error: {
    color: colors.danger,
    fontSize: typography.tiny,
    fontWeight: "800"
  }
});
