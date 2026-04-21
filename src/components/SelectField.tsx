import { useState } from "react";
import { Check, ChevronDown } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  detail?: string;
};

type SelectFieldProps<T extends string> = {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  disabled?: boolean;
  onChange: (value: T) => void;
};

export function SelectField<T extends string>({ label, value, options, disabled = false, onChange }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  const select = (nextValue: T) => {
    setOpen(false);
    if (nextValue !== value) onChange(nextValue);
  };

  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [
          styles.control,
          open && styles.controlOpen,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed
        ]}
      >
        <View style={styles.selectedText}>
          <Text style={styles.selectedLabel} numberOfLines={1}>{selected?.label}</Text>
          {selected?.detail ? <Text style={styles.selectedDetail} numberOfLines={1}>{selected.detail}</Text> : null}
        </View>
        <ChevronDown color={colors.muted} size={17} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          <ScrollView style={styles.menuScroll} nestedScrollEnabled>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => select(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && styles.optionPressed
                  ]}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]} numberOfLines={1}>
                      {option.label}
                    </Text>
                    {option.detail ? <Text style={styles.optionDetail} numberOfLines={1}>{option.detail}</Text> : null}
                  </View>
                  {active ? <Check color={colors.primary} size={16} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
  control: {
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  controlOpen: {
    borderColor: colors.primary
  },
  selectedText: {
    flex: 1,
    minWidth: 0
  },
  selectedLabel: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold
  },
  selectedDetail: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    lineHeight: 14,
    marginTop: 1
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  menuScroll: {
    maxHeight: 210
  },
  option: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  optionActive: {
    backgroundColor: colors.primarySoft
  },
  optionPressed: {
    backgroundColor: colors.gray100
  },
  optionText: {
    flex: 1,
    minWidth: 0
  },
  optionLabel: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 17,
    fontWeight: fontWeights.semibold
  },
  optionLabelActive: {
    color: colors.primaryDark
  },
  optionDetail: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    lineHeight: 14
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.88
  }
});
