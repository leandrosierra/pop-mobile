import { useEffect } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/Feedback";
import { useAuthStore } from "@/store/authStore";

export default function IndexRoute() {
  const { t } = useTranslation();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.userChoiceGeo.length) {
      router.replace("/setup/geography");
      return;
    }
    if (!user.userInterest.length) {
      router.replace("/setup/interests");
      return;
    }
    router.replace("/home");
  }, [hydrated, user]);

  return <LoadingState label={t("loadingUserProfile")} />;
}
