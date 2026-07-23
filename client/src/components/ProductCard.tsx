import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ProductCardProps } from "@/constants/types";
import { COLORS } from "@/constants";
import { useWishlist } from "src/context/WishlistContext";

const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id);

  return (
    <Link href={`/product/${product._id}`} asChild>
      <Pressable
        className="w-[48%] mb-4 bg-surface/50 rounded-lg overflow-hidden"
        style={({ pressed }) => ({
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {/* Product Image */}
        <View className="w-full h-48 bg-gray-100 relative">
          <Image
            source={{ uri: product.images?.[0] ?? "https://via.placeholder.com/150" }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />

          {/* Wishlist Button */}
          <Pressable
            className="absolute top-2 right-2 p-2 rounded-full bg-white z-10 shadow-sm"
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.secondary}
            />
          </Pressable>

          {/* Featured Badge */}
          {product.isFeatured && (
            <View className="absolute top-2 left-2 bg-primary/75 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold uppercase">
                Featured
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="star" size={16} color='#FFD700' />
            <Text className="text-xs text-secondary ml-1">
              {product.ratings.average.toFixed(1)}
            </Text>
          </View>
          <Text
            className="text-sm text-primary font-semibold mt-1"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-primary text-base font-bold">
              ${product.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
});

export default ProductCard;
