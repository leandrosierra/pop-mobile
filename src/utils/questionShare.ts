import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { PopQuestionDetail } from "@/domain/schemas";

export type QuestionShareMode = "detail" | "stats" | "discussion" | "meetings" | "law";

type QuestionShareLabels = {
  headline: string;
  cta: string;
  tagsLabel: string;
};

export type QuestionSharePayload = {
  title: string;
  message: string;
  url: string;
  dialogTitle: string;
};

export function buildQuestionSharePayload(
  question: PopQuestionDetail,
  mode: QuestionShareMode,
  labels: QuestionShareLabels
): QuestionSharePayload {
  const url = buildQuestionShareUrl(question.id, mode);
  const title = `POP - ${normalizeText(question.questionTitle)}`;
  const tags = [...question.geoTags.map((tag) => tag.label), ...question.interestTags.map((tag) => tag.label)]
    .filter(Boolean)
    .slice(0, 4)
    .join(" | ");
  const description = compactText(question.questionDesc, 220);
  const messageParts = [
    labels.headline,
    normalizeText(question.questionTitle),
    tags ? `${labels.tagsLabel}: ${tags}` : "",
    description,
    labels.cta
  ].filter(Boolean);

  return {
    title,
    message: messageParts.join("\n\n"),
    url,
    dialogTitle: title
  };
}

function buildQuestionShareUrl(questionId: number, mode: QuestionShareMode) {
  const configuredOrigin = process.env.EXPO_PUBLIC_POP_SHARE_ORIGIN?.trim().replace(/\/+$/, "");
  if (configuredOrigin) {
    const url = new URL(`/question/${questionId}`, configuredOrigin);
    url.searchParams.set("mode", mode);
    return url.toString();
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const url = new URL(`/question/${questionId}`, window.location.origin);
    url.searchParams.set("mode", mode);
    return url.toString();
  }

  return Linking.createURL(`question/${questionId}`, { queryParams: { mode } });
}

function compactText(value: string, maxLength: number) {
  const text = normalizeText(value);
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength - 3);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : slice.length).trim()}...`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
