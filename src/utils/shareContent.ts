import { Platform, Share } from "react-native";
import { QuestionSharePayload } from "@/utils/questionShare";

export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareContent(payload: QuestionSharePayload): Promise<ShareResult> {
  try {
    await Share.share(contentForPlatform(payload), {
      dialogTitle: payload.dialogTitle,
      subject: payload.title
    });
    return "shared";
  } catch (error) {
    if (isShareCancelled(error)) return "cancelled";
    if (Platform.OS === "web" && await copyShareText(payload)) return "copied";
    throw error;
  }
}

function contentForPlatform(payload: QuestionSharePayload) {
  if (Platform.OS === "android") {
    return {
      title: payload.title,
      message: `${payload.message}\n\n${payload.url}`
    };
  }

  return {
    title: payload.title,
    message: payload.message,
    url: payload.url
  };
}

async function copyShareText(payload: QuestionSharePayload) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(`${payload.message}\n\n${payload.url}`);
  return true;
}

function isShareCancelled(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /cancel/i.test(error.message);
}
