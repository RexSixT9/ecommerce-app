import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { ProductCardProps } from "@/constants/types";
import { Link } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";

export default function ProductCard({ product }: ProductCardProps) {
  const isLiked = false;

  return (
    <Link href={`/product/${product._id}`} asChild>
      <TouchableOpacity className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden">
        <View className="w-full h-48 bg-gray-100 relative">
          <Image
            source={{ uri: product.images[0] }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-2 right-2 p-2 rounded-full bg-white z-10 shadow-sm"
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.secondary}
            />
          </TouchableOpacity>

          {/* is Featured */}
          {product.isFeatured && (
            <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold uppercase">
                Featured
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="star" size={16} color={COLORS.primary} />
            <Text className="text-xs text-secondary ml-1">
              {product.ratings.average.toFixed(1)}
            </Text>
          </View>
          <Text className="text-sm text-primary font-semibold mt-1">
            {product.name}
          </Text>
          <View className='flex-row items-center'>
            <Text className="text-primary text-base font-bold">
              ${product.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
