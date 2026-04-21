import "react-native-gesture-handler";
import "@/i18n";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { isApiNetworkError } from "@/api/client";
import { AuthBootstrap } from "@/components/AuthGate";
import { LanguageBootstrap } from "@/components/LanguageBootstrap";
import { OfflineManager } from "@/components/OfflineManager";
import { OfflineStatusBadge } from "@/components/OfflineStatusBadge";
import { useDocumentTitle } from "@/config/environment";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => !isApiNetworkError(error) && failureCount < 1
    }
  }
});

export default function RootLayout() {
  useDocumentTitle("POP");
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById("pop-inter-font")) return;
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://fonts.gstatic.com";
    preconnect.crossOrigin = "anonymous";
    const stylesheet = document.createElement("link");
    stylesheet.id = "pop-inter-font";
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.append(preconnect, stylesheet);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LanguageBootstrap />
        <AuthBootstrap />
        <OfflineManager />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        <OfflineStatusBadge />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
