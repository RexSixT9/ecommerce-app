import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useClerk } from "@clerk/expo";
import { COLORS, SIDE_MENU_ITEMS } from "src/constants";
import { useMenu } from "src/context/MenuContext";

export default function SideMenu() {
  const { isOpen, closeMenu } = useMenu();
  const { user, signOut } = useClerk();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const DRAWER_WIDTH = width * 0.72;
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleNavigation = (route: string) => {
    closeMenu();
    router.push(route as any);
  };

  const handleLogout = async () => {
    closeMenu();
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <>
      <Animated.View
        className="absolute inset-0 bg-black/40 z-40"
        style={backdropStyle}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable className="flex-1" onPress={closeMenu} />
      </Animated.View>

      <Animated.View
        className="absolute top-0 left-0 bottom-0 z-50 bg-white"
        style={[drawerStyle, { width: DRAWER_WIDTH }]}
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          {/* User Section */}
          <View className="px-5 pt-6 pb-5 border-b border-border">
            {user ? (
              <View className="flex-row items-center">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="size-14 rounded-full border-2 border-border"
                />
                <View className="ml-4 flex-1">
                  <Text
                    className="text-primary font-bold text-base"
                    numberOfLines={1}
                  >
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
                  </Text>
                  <Text
                    className="text-secondary text-sm mt-0.5"
                    numberOfLines={1}
                  >
                    {user.emailAddresses?.[0]?.emailAddress ?? ""}
                  </Text>
                  {user.publicMetadata?.role === "admin" && (
                    <View className="mt-2 bg-primary/10 self-start px-2 py-0.5 rounded-full">
                      <Text className="text-primary text-xs font-bold">
                        Admin
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View>
                <View className="size-14 rounded-full bg-surface items-center justify-center">
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color={COLORS.secondary}
                  />
                </View>
                <Text className="text-primary font-bold text-base mt-3">
                  Welcome, Guest!
                </Text>
                <Text className="text-secondary text-sm mt-1" numberOfLines={2}>
                  Sign in for a personalized experience.
                </Text>
                <Pressable
                  className="mt-4 bg-primary py-2.5 rounded-full items-center"
                  onPress={() => handleNavigation("/sign-in")}
                >
                  <Text className="text-white font-bold text-sm">
                    Sign In / Sign Up
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Menu Items */}
          <View className="flex-1 pt-3">
            {SIDE_MENU_ITEMS.map((item, index) => (
              <Pressable
                key={item.id}
                className={`flex-row items-center px-5 py-4 ${index !== SIDE_MENU_ITEMS.length - 1 ? "border-b border-border" : ""}`}
                onPress={() => handleNavigation(item.route)}
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
              >
                <View className="size-10 rounded-full bg-surface items-center justify-center mr-4">
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text className="flex-1 text-primary font-medium" numberOfLines={1}>
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={COLORS.secondary}
                />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          {user && (
            <View className="px-5 pb-6 pt-2 border-t border-border">
              <Pressable
                className="flex-row items-center justify-center py-3.5 rounded-xl border border-accent/30 bg-accent/5"
                onPress={handleLogout}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.accent}
                />
                <Text className="text-accent font-bold ml-2">Logout</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </>
  );
}
