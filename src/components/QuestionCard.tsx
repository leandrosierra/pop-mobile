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
import { Check, Info, Minus, X } from "lucide-react-native";
import { TimestampBadge } from "@/components/TimestampBadge";
import { PopQuestion } from "@/domain/schemas";
import { colors, fontFamilies, fontWeights, radii, shadows, spacing, typography } from "@/theme";

type AnswerType = "YES" | "NO" | "NEUTRAL";

type QuestionCardProps = {
  question: PopQuestion;
  color: string;
  onAnswer: (answer: AnswerType) => void;
  onMoreInfo: () => void;
};

export function QuestionCard({ question, color, onAnswer, onMoreInfo }: QuestionCardProps) {
  const { t, i18n } = useTranslation();
  const accent = color || colors.orange;
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
          { backgroundColor: accent },
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
          <TimestampBadge value={question.createdAt} locale={i18n.language} inverted />
          <Text style={styles.creator} numberOfLines={1}>{question.creator}</Text>
        </View>
        <Text style={styles.title} adjustsFontSizeToFit minimumFontScale={0.78}>{question.questionTitle}</Text>
        {question.questionDesc ? <Text style={styles.description} numberOfLines={3}>{question.questionDesc}</Text> : null}
        <Pressable style={styles.moreButton} onPress={onMoreInfo}>
          <Info color={accent} size={16} />
          <Text style={[styles.moreLabel, { color: accent }]}>{t("moreInfo")}</Text>
        </Pressable>
      </Animated.View>
      <View style={styles.actions}>
        <Pressable style={[styles.voteButton, styles.voteNo]} onPress={() => commitAnswer("NO")}>
          <View style={[styles.voteIcon, styles.noIcon]}><X color="#fff" size={16} strokeWidth={2.4} /></View>
          <Text style={styles.voteLabel}>{t("no")}</Text>
        </Pressable>
        <Pressable style={[styles.voteButton, styles.voteNeutral]} onPress={() => commitAnswer("NEUTRAL")}>
          <View style={[styles.voteIcon, styles.neutralIcon]}><Minus color="#fff" size={16} strokeWidth={2.4} /></View>
          <Text style={styles.voteLabel}>{t("noOpinion")}</Text>
        </Pressable>
        <Pressable style={[styles.voteButton, styles.voteYes]} onPress={() => commitAnswer("YES")}>
          <View style={[styles.voteIcon, styles.yesIcon]}><Check color="#fff" size={16} strokeWidth={2.4} /></View>
          <Text style={styles.voteLabel}>{t("yes")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm
  },
  card: {
    minHeight: 292,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: "space-between",
    overflow: "hidden",
    ...shadows.lg
  },
  dragging: {
    opacity: 0.96
  },
  creatorRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  creator: {
    flexShrink: 1,
    fontFamily: fontFamilies.sans,
    color: "#fff",
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold,
    opacity: 0.92
  },
  title: {
    fontFamily: fontFamilies.display,
    color: "#fff",
    fontSize: typography.h1,
    lineHeight: 30,
    fontWeight: fontWeights.bold,
    letterSpacing: 0
  },
  description: {
    fontFamily: fontFamilies.sans,
    color: "#fff",
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    opacity: 0.9
  },
  moreButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: radii.full,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  moreLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  voteButton: {
    flex: 1,
    minHeight: 62,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    ...shadows.sm
  },
  voteNo: {
    borderColor: colors.dangerSoft
  },
  voteNeutral: {
    borderColor: colors.gray200
  },
  voteYes: {
    borderColor: colors.greenSoft
  },
  voteIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center"
  },
  noIcon: {
    backgroundColor: colors.voteNo
  },
  neutralIcon: {
    backgroundColor: colors.voteNeutral
  },
  yesIcon: {
    backgroundColor: colors.voteYes
  },
  voteLabel: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    textAlign: "center",
    fontWeight: fontWeights.semibold,
    paddingHorizontal: spacing.xs
  }
});
