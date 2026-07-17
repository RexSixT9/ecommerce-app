import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { CartItemProps } from "src/constants/types";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { COLORS } from "src/constants";

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemProps) {
  const imageUrl = item.product.images[0] || "https://via.placeholder.com/150";

  return (
    <View className="flex-row mb-4 bg-white p-3 rounded-xl shadow-sm">
      <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mr-3">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-primary font-medium text-sm mb-1">
              {item.product.name}
            </Text>
            <Text className="text-secondary text-xs mb-1">
              Size: {item.size}
            </Text>
          </View>
          <Pressable onPress={onRemove} className="mt-1">
            <Ionicons name="trash-outline" size={20} color="#FF4C3B" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-primary font-bold text-sm">
            ${item.product.price.toFixed(2)}
          </Text>
          <View className="flex-row items-center bg-surface rounded-full px-2 py-1">
            <Pressable
              onPress={() =>
                onUpdateQuantity && onUpdateQuantity(item.quantity - 1)
              }
              className="p-1"
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </Pressable>
            <Text className="text-primary font-bold text-sm mx-2">
              {item.quantity}
            </Text>
            <Pressable
              onPress={() =>
                onUpdateQuantity && onUpdateQuantity(item.quantity + 1)
              }
              className="p-1"
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>

        
      </View>
    </View>
  );
}
