import { View, Text, TouchableOpacity, Image } from "react-native";
import { HeaderProps } from "@/constants/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import { useCart } from "src/context/CartContext";
import { useMenu } from "src/context/MenuContext";

export default function Header({
  title,
  showBack,
  showSearch,
  showCart,
  showMenu,
  showLogo,
}: HeaderProps) {
  const router = useRouter();
  const {itemCount} = useCart();
  const {openMenu} = useMenu();

  return (
    <View className="relative flex-row items-center px-4 py-3 bg-white">
      <View className="flex-row items-center h-9" style={{ width: 84 }}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity className="mr-3 p-1" onPress={openMenu}>
            <Ionicons name="menu-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View
        className="absolute inset-x-0 items-center justify-center"
        pointerEvents="none"
      >
        {showLogo ? (
          <Image
            source={require("../../assets/logo.png")}
            className="w-28 h-8"
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

      <View
        className="ml-auto flex-row items-center justify-end gap-4 h-9"
        style={{ width: 84 }}
      >
        {showSearch && (
          <TouchableOpacity className="p-1">
            <Ionicons name="search-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {showCart && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/cart")} className="p-1">
            <View className="relative">
              <Ionicons name="bag-outline" size={24} color={COLORS.primary} />
              {itemCount > 0 && (
                <View className="absolute -top-2 -right-2 bg-accent rounded-full w-4 h-4 items-center justify-center z-10">
                  <Text className="text-[10px] font-bold text-white">{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
