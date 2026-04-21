import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, MapPin, Video } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { popApi } from "@/api/pop";
import { AppButton } from "@/components/AppButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";
import { FormField } from "@/components/FormField";
import { PaginationControls } from "@/components/PaginationControls";
import { SelectField, SelectOption } from "@/components/SelectField";
import { colors, fontFamilies, fontWeights, radii, spacing, typography } from "@/theme";

type MeetingType = "VIRTUEL" | "PHYSIQUE";

type QuestionMeetingsProps = {
  questionId: number;
  token: string;
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 16).replace("T", " ");

const toApiDate = (value: string) => new Date(value.trim().replace(" ", "T")).toISOString();

const formatMeetingDate = (value?: string | number) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

export function QuestionMeetings({ questionId, token }: QuestionMeetingsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [typeMeeting, setTypeMeeting] = useState<MeetingType>("VIRTUEL");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [lieu, setLieu] = useState("");
  const [url, setUrl] = useState("");
  const [page, setPage] = useState(0);
  const [dateDebut, setDateDebut] = useState(formatDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [dateFin, setDateFin] = useState(formatDateInput(new Date(Date.now() + 25 * 60 * 60 * 1000)));

  const meetingTypes = useMemo<SelectOption<MeetingType>[]>(
    () => [
      { value: "VIRTUEL", label: t("virtualMeeting"), detail: t("virtualMeetingDetail") },
      { value: "PHYSIQUE", label: t("physicalMeeting"), detail: t("physicalMeetingDetail") }
    ],
    [t]
  );

  const query = useQuery({
    queryKey: ["question-meetings", questionId, page],
    queryFn: () => popApi.questionMeetingsPage(token, questionId, page)
  });

  const mutation = useMutation({
    mutationFn: () => popApi.createQuestionMeeting(token, questionId, {
      typeMeeting,
      titre: titre.trim(),
      description: description.trim(),
      lieu: lieu.trim(),
      url: url.trim(),
      dateDebut: toApiDate(dateDebut),
      dateFin: toApiDate(dateFin)
    }),
    onSuccess: () => {
      setTitre("");
      setDescription("");
      setLieu("");
      setUrl("");
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["question-meetings", questionId] });
    }
  });

  const meetings = query.data?.content ?? [];
  const canSubmit = titre.trim().length >= 3 && (typeMeeting === "VIRTUEL" ? url.trim().length > 0 : lieu.trim().length > 0);

  return (
    <View style={styles.root}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{t("scheduleMeeting")}</Text>
        <SelectField label={t("meetingType")} value={typeMeeting} options={meetingTypes} onChange={setTypeMeeting} />
        <FormField label={t("meetingTitle")} value={titre} onChangeText={setTitre} placeholder={t("meetingTitlePlaceholder")} />
        <FormField label={t("meetingDateStart")} value={dateDebut} onChangeText={setDateDebut} placeholder="2026-04-22 18:00" />
        <FormField label={t("meetingDateEnd")} value={dateFin} onChangeText={setDateFin} placeholder="2026-04-22 19:00" />
        {typeMeeting === "VIRTUEL" ? (
          <FormField label={t("meetingUrl")} value={url} onChangeText={setUrl} placeholder="https://..." icon={<Video color={colors.primary} size={16} />} />
        ) : (
          <FormField label={t("meetingPlace")} value={lieu} onChangeText={setLieu} placeholder={t("meetingPlacePlaceholder")} icon={<MapPin color={colors.primary} size={16} />} />
        )}
        <FormField label={t("description")} value={description} onChangeText={setDescription} placeholder={t("meetingDescriptionPlaceholder")} multiline />
        <AppButton label={t("publishMeeting")} size="sm" disabled={!canSubmit} loading={mutation.isPending} onPress={() => mutation.mutate()} />
        {mutation.isError ? <Text style={styles.error}>{t("cannotProcessRequest")}</Text> : null}
      </View>

      {query.isLoading ? <LoadingState label={t("loadingData")} /> : null}
      {query.isError ? <ErrorState label={t("errorFetchingQuestionList")} /> : null}
      {!query.isLoading && !query.isError && !meetings.length ? <EmptyState label={t("noMeetingsYet")} /> : null}

      <View style={styles.list}>
        {meetings.map((meeting) => (
          <View key={meeting.id} style={styles.meeting}>
            <View style={styles.meetingHeader}>
              <Text style={styles.meetingTitle} numberOfLines={2}>{meeting.titre}</Text>
              <Text style={styles.meetingType}>{meeting.typeMeeting === "PHYSIQUE" ? t("physical") : t("virtual")}</Text>
            </View>
            <View style={styles.metaRow}>
              <CalendarClock color={colors.muted} size={14} />
              <Text style={styles.metaText}>{formatMeetingDate(meeting.dateDebut)}</Text>
            </View>
            {meeting.lieu ? (
              <View style={styles.metaRow}>
                <MapPin color={colors.muted} size={14} />
                <Text style={styles.metaText}>{meeting.lieu}</Text>
              </View>
            ) : null}
            {meeting.description ? <Text style={styles.description}>{meeting.description}</Text> : null}
            {meeting.url ? (
              <Pressable style={styles.link} onPress={() => Linking.openURL(String(meeting.url))}>
                <ExternalLink color={colors.primary} size={14} />
                <Text style={styles.linkText}>{t("openMeetingLink")}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
      <PaginationControls
        page={page}
        totalPages={query.data?.totalPages}
        totalElements={query.data?.totalElements}
        disabled={query.isFetching}
        onPageChange={setPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm
  },
  form: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    fontWeight: fontWeights.semibold
  },
  list: {
    gap: spacing.xs
  },
  meeting: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    padding: spacing.sm
  },
  meetingHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  meetingTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: fontWeights.semibold
  },
  meetingType: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  metaText: {
    flex: 1,
    color: colors.muted,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.medium
  },
  description: {
    color: colors.text,
    fontFamily: fontFamilies.sans,
    fontSize: typography.small,
    lineHeight: 18
  },
  link: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  linkText: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  }
});
