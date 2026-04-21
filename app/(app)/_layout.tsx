import { Tabs } from "expo-router";
import { CirclePlus, Home, ListChecks, Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { colors, fontFamilies, fontWeights, typography } from "@/theme";

export default function AppTabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fontFamilies.sans,
          fontSize: typography.micro,
          fontWeight: fontWeights.medium
        },
        tabBarStyle: {
          minHeight: 64,
          borderTopColor: colors.border,
          backgroundColor: "rgba(255,255,255,0.94)"
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
