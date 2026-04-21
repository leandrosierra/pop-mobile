import { Tabs } from "expo-router";
import { CirclePlus, Home, ListChecks, Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { colors, typography } from "@/theme";

export default function AppTabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: typography.tiny,
          fontWeight: "800"
        },
        tabBarStyle: {
          minHeight: 62,
          borderTopColor: colors.border,
          backgroundColor: colors.surface
        },
        tabBarItemStyle: {
          paddingVertical: 6
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => <Home color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="create-question"
        options={{
          title: t("create"),
          tabBarIcon: ({ color }) => <CirclePlus color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: t("summary"),
          tabBarIcon: ({ color }) => <ListChecks color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />
        }}
      />
    </Tabs>
  );
}
