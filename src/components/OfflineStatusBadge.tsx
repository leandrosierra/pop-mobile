import { StyleSheet, Text, View } from "react-native";
import { RefreshCw, WifiOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useOfflineStore } from "@/store/offlineStore";
import { colors, fontFamilies, fontWeights, radii, shadows, spacing, typography } from "@/theme";

export function OfflineStatusBadge() {
  const { t } = useTranslation();
  const online = useOfflineStore((state) => state.online);
  const syncing = useOfflineStore((state) => state.syncing);
  const queueLength = useOfflineStore((state) => state.queue.length);

  if (online && !syncing && queueLength === 0) return null;

  const label = syncing
    ? t("offlineSyncing")
    : online
      ? t("offlineChangesQueued", { count: queueLength })
      : `${t("connectionLost")} · ${t("offlineModeActive")}${queueLength ? ` · ${t("offlineChangesQueued", { count: queueLength })}` : ""}`;
  const Icon = online ? RefreshCw : WifiOff;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, online ? styles.pending : styles.offline]}>
        <Icon color={online ? colors.warning : colors.danger} size={15} />
        <Text style={[styles.label, online ? styles.pendingText : styles.offlineText]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    pointerEvents: "none",
    top: 10,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
    alignItems: "center"
  },
  badge: {
    maxWidth: 390,
    minHeight: 34,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm
  },
  offline: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger
  },
  pending: {
    backgroundColor: colors.yellowSoft,
    borderColor: colors.warning
  },
  label: {
    flexShrink: 1,
    fontFamily: fontFamilies.sans,
    fontSize: typography.tiny,
    fontWeight: fontWeights.semibold
  },
  offlineText: {
    color: colors.danger
  },
  pendingText: {
    color: colors.orange700
  }
});
