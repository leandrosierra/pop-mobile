import { ReactNode, useEffect } from "react";
import { router, useLocalSearchParams, usePathname, useRootNavigationState, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/Feedback";
import { useAuthStore } from "@/store/authStore";
import { isAdminUser, postAuthRouteForUser } from "@/utils/authRouting";
import { currentRouteWithQuery, safeInternalRoute } from "@/utils/redirectRoute";

type AuthGateProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSetup?: boolean;
};

function useAuthHydration() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}

function useNavigationReady() {
  return Boolean(useRootNavigationState()?.key);
}

export function AuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const navigationReady = useNavigationReady();
  const pathname = usePathname();
  const segments = useSegments();
  const isAuthRoute = segments[0] === "(auth)" || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  useEffect(() => {
    if (navigationReady && !isAuthRoute) void hydrate();
  }, [hydrate, isAuthRoute, navigationReady]);

  return null;
}

export function AuthGate({ children, requireAdmin = false, requireSetup = true }: AuthGateProps) {
  const { t } = useTranslation();
  const navigationReady = useNavigationReady();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const pathname = usePathname();
  const params = useLocalSearchParams();
  useAuthHydration();

  useEffect(() => {
    if (!navigationReady || !hydrated) return;
    if (!accessToken || !user) {
      router.replace({ pathname: "/login", params: { next: currentRouteWithQuery(pathname, params, ["id"]) } });
      return;
    }

    const nextRoute = postAuthRouteForUser(user);
    if (requireSetup && nextRoute !== "/home") {
      router.replace(nextRoute);
      return;
    }

    if (requireAdmin && !isAdminUser(user)) {
      router.replace(nextRoute);
    }
  }, [accessToken, hydrated, navigationReady, params, pathname, requireAdmin, requireSetup, user]);

  if (!navigationReady || !hydrated || !accessToken || !user) {
    return <LoadingState label={t("loadingUserProfile")} />;
  }

  if (requireSetup && postAuthRouteForUser(user) !== "/home") {
    return <LoadingState label={t("loadingUserProfile")} />;
  }

  if (requireAdmin && !isAdminUser(user)) {
    return <LoadingState label={t("loadingUserProfile")} />;
  }

  return <>{children}</>;
}

export function AuthRedirect({ children }: { children: ReactNode }) {
  const navigationReady = useNavigationReady();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (!navigationReady || !hydrated || !accessToken || !user) return;
    router.replace(safeInternalRoute(params.next) || postAuthRouteForUser(user));
  }, [accessToken, hydrated, navigationReady, params.next, user]);

  if (accessToken && user) {
    return null;
  }

  return <>{children}</>;
}
