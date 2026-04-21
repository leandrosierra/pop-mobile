import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { colors, spacing } from "@/theme";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function AppScreen({ children, scroll = false, padded = true }: AppScreenProps) {
  const content = (
    <View style={[styles.content, padded && styles.padded]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboard: {
    flex: 1
  },
  content: {
    flex: 1,
    width: "100%"
  },
  padded: {
    padding: spacing.md
  },
  scrollContent: {
    flexGrow: 1
  }
});
