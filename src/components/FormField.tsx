import { ReactNode, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type FormFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string | null;
  icon?: ReactNode;
};

export function FormField({ label, helper, error, icon, multiline, style, ...props }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, multiline && styles.multilineShell, focused && styles.focusedShell, error && styles.errorShell]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.subtle}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
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
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  inputShell: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md
  },
  focusedShell: {
    borderColor: colors.primary,
    backgroundColor: colors.surface
  },
  multilineShell: {
    minHeight: 104,
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
    minHeight: 46,
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.body,
    outlineStyle: "none" as never
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  helper: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium
  },
  error: {
    fontFamily: fontFamilies.sans,
    color: colors.danger,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  }
});
