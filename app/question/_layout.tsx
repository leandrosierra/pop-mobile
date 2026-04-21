import { Stack } from "expo-router";
import { AuthGate } from "@/components/AuthGate";

export default function QuestionLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
