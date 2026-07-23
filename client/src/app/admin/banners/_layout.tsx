import { Stack } from "expo-router";
import { COLORS } from "@/constants";

export default function BannersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Manage Banners", headerShown: false }} />
      <Stack.Screen name="add" options={{ title: "Add Banner" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit Banner" }} />
    </Stack>
  );
}
