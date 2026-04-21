import { X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
};

export function Chip({ label, selected = false, onPress, onRemove }: ChipProps) {
  const Root = onPress ? Pressable : View;
  return (
    <Root
      onPress={onPress}
      style={[styles.root, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.remove}>
          <X size={14} color={selected ? "#fff" : colors.primary} />
        </Pressable>
      ) : null}
    </Root>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 28,
    maxWidth: "100%",
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  label: {
    fontFamily: fontFamilies.sans,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
    flexShrink: 1,
    lineHeight: 16
  },
  selectedLabel: {
    color: "#fff"
  },
  remove: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  }
});
