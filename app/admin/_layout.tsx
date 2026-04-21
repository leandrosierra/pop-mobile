import { Stack } from "expo-router";
import { AuthGate } from "@/components/AuthGate";

export default function AdminLayout() {
  return (
    <AuthGate requireAdmin>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
