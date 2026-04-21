import { router } from "expo-router";
import { ChevronLeft, Plus, Settings } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

type HeaderProps = {
  title?: string;
  back?: boolean;
  settings?: boolean;
  create?: boolean;
};

export function Header({ title = "POP!", back = false, settings = true, create = true }: HeaderProps) {
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
      <Pressable onPress={() => router.replace("/home")}>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
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
    minHeight: 58,
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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0
  }
});
