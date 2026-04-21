import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { PopLocation } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, shadows, spacing, typography } from "@/theme";

export default function GeographySetupScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.requireToken());
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState<PopLocation[]>([]);

  const locationsQuery = useQuery({
    queryKey: ["setup-locations", searchText],
    queryFn: () => popApi.searchLocations(searchText),
    enabled: searchText.trim().length >= 2
  });

  const saveMutation = useMutation({
    mutationFn: () => popApi.saveGeoLocations(token, selected),
    onSuccess: async () => {
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
      <View style={styles.content}>
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
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.sm
  },
  title: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: "900",
    textAlign: "center"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  error: {
    color: colors.danger,
    fontWeight: "800"
  }
});
