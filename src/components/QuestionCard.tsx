import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react-native";
import { PopQuestion } from "@/domain/schemas";
import { colors, spacing } from "@/theme";

type AnswerType = "YES" | "NO" | "NEUTRAL";

type QuestionCardProps = {
  question: PopQuestion;
  color: string;
  onAnswer: (answer: AnswerType) => void;
  onMoreInfo: () => void;
};

export function QuestionCard({ question, color, onAnswer, onMoreInfo }: QuestionCardProps) {
  const { t } = useTranslation();
  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);

  const commitAnswer = (answer: AnswerType) => {
    const width = Dimensions.get("window").width;
    const toValue =
      answer === "YES"
        ? { x: width * 1.4, y: 0 }
        : answer === "NO"
          ? { x: -width * 1.4, y: 0 }
          : { x: 0, y: width };

    Animated.timing(position, {
      toValue,
      duration: 220,
      useNativeDriver: true
    }).start(() => onAnswer(answer));
  };

  const reset = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
      onPanResponderGrant: () => setDragging(true),
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (_, gesture) => {
        setDragging(false);
        if (gesture.dx > 120) commitAnswer("YES");
        else if (gesture.dx < -120) commitAnswer("NO");
        else if (gesture.dy > 110) commitAnswer("NEUTRAL");
        else if (gesture.dy < -90 && Math.abs(gesture.dx) < 40) {
          reset();
          onMoreInfo();
        } else reset();
      }
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ["-10deg", "0deg", "10deg"]
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          { backgroundColor: color },
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate }
            ]
          },
          dragging && styles.dragging
        ]}
      >
        <View style={styles.creatorRow}>
          <Text style={styles.creator}>{question.creator}</Text>
        </View>
        <Text style={styles.title}>{question.questionTitle}</Text>
        <Pressable style={styles.moreButton} onPress={onMoreInfo}>
          <Info color={color} size={18} />
          <Text style={[styles.moreLabel, { color }]}>{t("moreInfo")}</Text>
        </Pressable>
      </Animated.View>
      <View style={styles.actions}>
        <Pressable style={[styles.roundButton, { backgroundColor: color }]} onPress={() => commitAnswer("NO")}>
          <Text style={styles.roundLabel}>{t("no")}</Text>
        </Pressable>
        <Pressable style={[styles.roundButton, { backgroundColor: color }]} onPress={() => commitAnswer("NEUTRAL")}>
          <Text style={styles.smallRoundLabel}>{t("noOpinion")}</Text>
        </Pressable>
        <Pressable style={[styles.roundButton, { backgroundColor: color }]} onPress={() => commitAnswer("YES")}>
          <Text style={styles.roundLabel}>{t("yes")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg
  },
  card: {
    minHeight: 440,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "space-between"
  },
  dragging: {
    opacity: 0.96
  },
  creatorRow: {
    alignSelf: "stretch",
    alignItems: "flex-end"
  },
  creator: {
    color: "#fff",
    fontStyle: "italic",
    fontWeight: "700"
  },
  title: {
    color: "#fff",
    textAlign: "center",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900"
  },
  moreButton: {
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  moreLabel: {
    fontWeight: "900"
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: spacing.md
  },
  roundButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  roundLabel: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900"
  },
  smallRoundLabel: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "900",
    paddingHorizontal: spacing.xs
  }
});
