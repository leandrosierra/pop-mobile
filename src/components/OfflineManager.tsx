import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSegments } from "expo-router";
import { checkApiReachability } from "@/api/client";
import { syncOfflineQueue } from "@/services/offlineSync";
import { useOfflineStore } from "@/store/offlineStore";

export function OfflineManager() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const segments = useSegments();
  const hydrate = useOfflineStore((state) => state.hydrate);
  const hydrated = useOfflineStore((state) => state.hydrated);
  const online = useOfflineStore((state) => state.online);
  const syncing = useOfflineStore((state) => state.syncing);
  const queueLength = useOfflineStore((state) => state.queue.length);
  const isAuthRoute = segments[0] === "(auth)" || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  useEffect(() => {
    if (isAuthRoute) return;
    if (typeof navigator !== "undefined" && "onLine" in navigator) {
      useOfflineStore.getState().setOnline(navigator.onLine);
    }
    void hydrate();
  }, [hydrate, isAuthRoute]);

  useEffect(() => {
    if (isAuthRoute) return;
    let active = true;
    const probe = async () => {
      const reachable = await checkApiReachability();
      if (active) useOfflineStore.getState().setOnline(reachable);
    };
    const applyBrowserOnline = () => {
      if (typeof navigator !== "undefined" && "onLine" in navigator) {
        useOfflineStore.getState().setOnline(navigator.onLine);
        if (!navigator.onLine) return;
      }
      void probe();
    };

    applyBrowserOnline();
    const interval = setInterval(probe, 15_000);
    if (typeof window !== "undefined") {
      window.addEventListener("online", applyBrowserOnline);
      window.addEventListener("offline", applyBrowserOnline);
    }

    return () => {
      active = false;
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("online", applyBrowserOnline);
        window.removeEventListener("offline", applyBrowserOnline);
      }
    };
  }, [isAuthRoute]);

  useEffect(() => {
    if (isAuthRoute || !hydrated || !online || syncing || queueLength === 0) return;
    void syncOfflineQueue().then(() => queryClient.invalidateQueries());
  }, [hydrated, isAuthRoute, online, queryClient, queueLength, syncing]);

  return null;
}
