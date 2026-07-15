import { COLORS } from "@/constants";
import { CategoryItemProps } from "@/constants/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, Text, View } from "react-native";

export default function CategoryItem({
  item,
  isSelected,
  onPress,
}: CategoryItemProps) {
  return (
    <Pressable onPress={onPress} className="mr-4 items-center">
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${isSelected ? "bg-primary" : "bg-surface"}`}
      >
        <Ionicons
          name={item.icon as any}
          size={24}
          color={isSelected ? "#fff" : COLORS.primary}
        />
      </View>
      <Text
        className={`text-xs font-medium ${isSelected ? "text-primary" : "text-secondary"}`}
      >
        {item.name}
      </Text>
    </Pressable>
  );
}
