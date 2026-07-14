import { View, Text, TouchableOpacity, Image } from "react-native";
import { HeaderProps } from "@/constants/types";
// Ensure this import is correct for your project (often @expo/vector-icons/Ionicons in Expo)
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";

export default function Header({
  title,
  showBack,
  showSearch,
  showCart,
  showMenu,
  showLogo,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      {/* LEFT ZONE: Back & Menu (takes up 25% width to balance right side) */}
      <View className="flex-row items-center w-1/4">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity className="mr-3">
            <Ionicons name="menu-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* CENTER ZONE: Logo or Title */}
      <View className="flex-1 items-center justify-center">
        {showLogo ? (
          <Image
            source={require("@/assets/logo.png")}
            // Use fixed constraints for logos to prevent stretching UI
            className="w-24 h-8"
            resizeMode="contain"
          />
        ) : (
          title && (
            <Text
              className="text-xl font-bold text-primary text-center"
              numberOfLines={1}
            >
              {title}
            </Text>
          )
        )}
      </View>

      {/* RIGHT ZONE: Search & Cart (takes up 25% width to balance left side) */}
      <View className="flex-row items-center justify-end gap-4 w-1/4">
        {showSearch && (
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {showCart && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
            <View className="relative">
              <Ionicons name="bag-outline" size={24} color={COLORS.primary} />
              <View className="absolute -top-2 -right-2 bg-accent rounded-full w-4 h-4 items-center justify-center z-10">
                <Text className="text-[10px] font-bold text-white">5</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
