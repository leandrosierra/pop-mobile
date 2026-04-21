import { Stack } from "expo-router";
import { AuthGate } from "@/components/AuthGate";

export default function SetupLayout() {
  return (
    <AuthGate requireSetup={false}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
