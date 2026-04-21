import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  segments: Segment<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, segments, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.root}>
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable key={segment.value} style={[styles.item, active && styles.activeItem]} onPress={() => onChange(segment.value)}>
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    padding: 3
  },
  item: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm
  },
  activeItem: {
    backgroundColor: colors.primary
  },
  label: {
    color: colors.primaryDark,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 16,
    fontWeight: fontWeights.semibold
  },
  activeLabel: {
    color: "#fff"
  }
});
