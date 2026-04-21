import { Stack } from "expo-router";
import { AuthRedirect } from "@/components/AuthGate";

export default function AuthLayout() {
  return (
    <AuthRedirect>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthRedirect>
  );
}
