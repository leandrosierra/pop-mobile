import { router } from "expo-router";
import { ChevronLeft, Plus, Settings } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { environmentLabel, useDocumentTitle } from "@/config/environment";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type HeaderProps = {
  title?: string;
  back?: boolean;
  settings?: boolean;
  create?: boolean;
  homeLink?: boolean;
};

export function Header({ title = "POP", back = false, settings = true, create = true, homeLink = true }: HeaderProps) {
  useDocumentTitle(title);
  const titleNode = (
    <View style={styles.titleRow}>
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
        {title.replace(/!$/, "")}
      </Text>
      <Text style={styles.badge}>{environmentLabel}</Text>
    </View>
  );
  return (
    <View style={styles.root}>
      <View style={styles.slot}>
        {back ? (
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft color={colors.gray700} size={24} />
          </Pressable>
        ) : settings ? (
          <Pressable style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Settings color={colors.gray700} size={20} />
          </Pressable>
        ) : null}
      </View>
      {homeLink && !back ? <Pressable style={styles.titleButton} onPress={() => router.replace("/home")}>{titleNode}</Pressable> : <View style={styles.titleButton}>{titleNode}</View>}
      <View style={[styles.slot, styles.rightSlot]}>
        {create ? (
          <Pressable style={styles.iconButton} onPress={() => router.push("/create-question")}>
            <Plus color={colors.gray700} size={22} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.sm
  },
  slot: {
    width: 54,
    alignItems: "flex-start"
  },
  rightSlot: {
    alignItems: "flex-end"
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray100
  },
  titleButton: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.subtitle,
    fontWeight: fontWeights.bold,
    letterSpacing: 0,
    lineHeight: 24,
    flexShrink: 1
  },
  titleRow: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  badge: {
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: colors.gray100,
    color: colors.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.6
  }
});
