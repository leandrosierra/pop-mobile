import { X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

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
        <Pressable onPress={onRemove} hitSlop={8}>
          <X size={14} color={selected ? "#fff" : colors.primary} />
        </Pressable>
      ) : null}
    </Root>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 34,
    maxWidth: "100%",
    borderRadius: 8,
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
    color: colors.text,
    fontWeight: "600",
    flexShrink: 1
  },
  selectedLabel: {
    color: "#fff"
  }
});
