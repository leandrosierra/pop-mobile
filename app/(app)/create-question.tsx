import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppScreen } from "@/components/AppScreen";
import { Chip } from "@/components/Chip";
import { FormField } from "@/components/FormField";
import { Header } from "@/components/Header";
import { popApi } from "@/api/pop";
import { PopInterest, PopLocation } from "@/domain/schemas";
import { useAuthStore } from "@/store/authStore";
import { colors, fontFamilies, fontWeights, spacing, typography } from "@/theme";

export default function CreateQuestionScreen() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.requireToken());
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDesc, setQuestionDesc] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<PopLocation[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<PopInterest[]>([]);

  const interestsQuery = useQuery({
    queryKey: ["interests"],
    queryFn: () => popApi.getInterests()
  });

  const locationsQuery = useQuery({
    queryKey: ["locations", locationSearch],
    queryFn: () => popApi.searchLocations(locationSearch),
    enabled: locationSearch.trim().length >= 2
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      popApi.saveQuestion(token, {
        questionTitle: questionTitle.trim(),
        questionDesc: questionDesc.trim(),
        geoTags: selectedLocations,
        interestTags: selectedInterests.map((interest) => interest.code)
      }),
    onSuccess: (result) => {
      Alert.alert(t("requestSuccess"), result.queued ? t("offlineChangeSaved") : t("questionCreatedSuccessfully"), [
        { text: t("ok"), onPress: () => router.replace("/home") }
      ]);
    },
    onError: (err) => Alert.alert(t("problemInCreatingQuestion"), err instanceof Error ? err.message : t("cannotProcessRequest"))
  });

  const formError = useMemo(() => {
    if (!questionTitle.trim()) return t("questionTitle");
    if (!questionDesc.trim()) return t("questionDescription");
    if (!selectedLocations.length) return t("pleaseChooseOneLocation");
    if (!selectedInterests.length) return t("chooseOneInterest");
    return null;
  }, [questionTitle, questionDesc, selectedLocations.length, selectedInterests.length, t]);

  const toggleInterest = (interest: PopInterest) => {
    setSelectedInterests((current) =>
      current.some((item) => item.code === interest.code)
        ? current.filter((item) => item.code !== interest.code)
        : [...current, interest]
    );
  };

  const addLocation = (location: PopLocation) => {
    setSelectedLocations((current) =>
      current.some((item) => item.id === location.id && item.type === location.type)
        ? current
        : [...current, location].slice(0, 5)
    );
  };

  return (
    <AppScreen scroll>
      <Header title={t("createNewQuestion")} create={false} settings={false} />
      <AppCard style={styles.form}>
        <Text style={styles.title}>{t("proposeReferendumHere")}</Text>
        <FormField label={t("questionTitle")} value={questionTitle} onChangeText={setQuestionTitle} placeholder={t("questionTitle")} maxLength={120} />
        <FormField label={t("questionDescription")} value={questionDesc} onChangeText={setQuestionDesc} placeholder={t("questionDescription")} multiline />

        <View style={styles.sectionBlock}>
          <Text style={styles.section}>{t("geographicalLocations")}</Text>
          <View style={styles.chipWrap}>
            {selectedLocations.map((location) => (
              <Chip key={`${location.type}-${location.id}`} label={location.label} selected onRemove={() => setSelectedLocations((current) => current.filter((item) => item !== location))} />
            ))}
          </View>
          <FormField value={locationSearch} onChangeText={setLocationSearch} placeholder={t("search")} />
          <View style={styles.chipWrap}>
            {(locationsQuery.data ?? []).slice(0, 8).map((location) => (
              <Chip key={`${location.type}-${location.id}`} label={location.label} onPress={() => addLocation(location)} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.section}>{t("interests")}</Text>
          <View style={styles.chipWrap}>
            {(interestsQuery.data ?? []).map((interest) => (
              <Chip
                key={interest.code}
                label={interest.label}
                selected={selectedInterests.some((item) => item.code === interest.code)}
                onPress={() => toggleInterest(interest)}
              />
            ))}
          </View>
        </View>
        {formError ? <Text style={styles.helper}>{formError}</Text> : null}
        <AppButton label={t("save")} loading={saveMutation.isPending} disabled={Boolean(formError)} onPress={() => saveMutation.mutate()} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  title: {
    fontFamily: fontFamilies.display,
    color: colors.primaryDark,
    fontSize: typography.subtitle,
    fontWeight: fontWeights.semibold
  },
  sectionBlock: {
    gap: spacing.xs
  },
  section: {
    fontFamily: fontFamilies.sans,
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  helper: {
    fontFamily: fontFamilies.sans,
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: fontWeights.medium
  }
});
