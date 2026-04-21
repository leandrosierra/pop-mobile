import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { PopLocation } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

export default function GeographySetupScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const setUserGeoChoices = useAuthStore((state) => state.setUserGeoChoices);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState<PopLocation[]>([]);

  const locationsQuery = useQuery({
    queryKey: ["setup-locations", searchText],
    queryFn: () => popApi.searchLocations(searchText),
    enabled: searchText.trim().length >= 2
  });

  const saveMutation = useMutation({
    mutationFn: () => popApi.saveGeoLocations(token, selected),
    onSuccess: async (result) => {
      if (result.queued) {
        setUserGeoChoices(selected);
        queryClient.setQueryData(["current-user"], useAuthStore.getState().user);
        const user = useAuthStore.getState().user;
        if (!user?.userInterest.length) router.replace("/setup/interests");
        else router.replace("/home");
        return;
      }

      const user = await refreshCurrentUser();
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      if (!user?.userInterest.length) router.replace("/setup/interests");
      else router.replace("/home");
    }
  });

  const addLocation = (location: PopLocation) => {
    setSelected((current) =>
      current.some((item) => item.id === location.id && item.type === location.type)
        ? current
        : [...current, location].slice(0, 5)
    );
  };

  return (
    <AppScreen scroll>
      <Header title={t("geographicalLocations")} back create={false} settings={false} homeLink={false} />
      <AppCard style={styles.content}>
        <Text style={styles.title}>{t("searchAndSelectLocations")}</Text>
        <View style={styles.chipWrap}>
          {selected.map((location) => (
            <Chip key={`${location.type}-${location.id}`} label={location.label} selected onRemove={() => setSelected((current) => current.filter((item) => item !== location))} />
          ))}
        </View>
        <FormField value={searchText} onChangeText={setSearchText} placeholder={t("search")} />
        <View style={styles.chipWrap}>
          {(locationsQuery.data ?? []).map((location) => (
            <Chip key={`${location.type}-${location.id}`} label={location.label} onPress={() => addLocation(location)} />
          ))}
        </View>
        {saveMutation.isError ? <Text style={styles.error}>{saveMutation.error instanceof Error ? saveMutation.error.message : t("cannotProcessRequest")}</Text> : null}
        <AppButton label={t("save")} disabled={!selected.length} loading={saveMutation.isPending} onPress={() => saveMutation.mutate()} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: fontWeights.semibold
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  }
});
