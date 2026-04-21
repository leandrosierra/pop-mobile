import { StyleSheet, Text, View } from "react-native";
import { Clock3 } from "lucide-react-native";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";
import { formatTimestampBadge } from "@/utils/time";

type TimestampBadgeProps = {
  value?: string | number | Date | null;
  locale?: string;
  inverted?: boolean;
};

export function TimestampBadge({ value, locale, inverted = false }: TimestampBadgeProps) {
  const label = formatTimestampBadge(value, locale);
  if (!label) return null;

  return (
    <View style={[styles.badge, inverted && styles.badgeInverted]}>
      <Clock3 color={inverted ? "#fff" : colors.muted} size={12} strokeWidth={2.2} />
      <Text style={[styles.text, inverted && styles.textInverted]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 22,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  badgeInverted: {
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  text: {
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold
  },
  textInverted: {
    color: "#fff"
  }
});
