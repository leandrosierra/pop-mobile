import { useEffect } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/Feedback";
import { useAuthStore } from "@/store/authStore";
import { postAuthRouteForUser } from "@/utils/authRouting";

export default function IndexRoute() {
  const { t } = useTranslation();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(postAuthRouteForUser(user));
  }, [hydrated, user]);

  return <LoadingState label={t("loadingUserProfile")} />;
}
