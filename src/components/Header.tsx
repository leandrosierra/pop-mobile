import { router } from "expo-router";
import { ChevronLeft, Plus, Settings } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { pageTitle, useDocumentTitle } from "@/config/environment";
import { colors, radii, spacing, typography } from "@/theme";

type HeaderProps = {
  title?: string;
  back?: boolean;
  settings?: boolean;
  create?: boolean;
  homeLink?: boolean;
};

export function Header({ title = "POP", back = false, settings = true, create = true, homeLink = true }: HeaderProps) {
  const displayTitle = pageTitle(title);
  useDocumentTitle(title);
  const titleNode = (
    <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.68}>
      {displayTitle}
    </Text>
  );
  return (
    <View style={styles.root}>
      <View style={styles.slot}>
        {back ? (
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft color={colors.primary} size={26} />
          </Pressable>
        ) : settings ? (
          <Pressable style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Settings color={colors.primary} size={22} />
          </Pressable>
        ) : null}
      </View>
      {homeLink && !back ? <Pressable style={styles.titleButton} onPress={() => router.replace("/home")}>{titleNode}</Pressable> : <View style={styles.titleButton}>{titleNode}</View>}
      <View style={[styles.slot, styles.rightSlot]}>
        {create ? (
          <Pressable style={styles.iconButton} onPress={() => router.push("/create-question")}>
            <Plus color={colors.primary} size={24} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  titleButton: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm
  },
  title: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30
  }
});
