import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { useWishlist } from "src/context/WishlistContext";
import { useRouter } from "expo-router";
import ProductCard from "src/components/ProductCard";
import { COLORS } from "@/constants";
import EmptyStateCard from "src/components/EmptyStateCard";

export default function Favorites() {
  const { wishlist, loading } = useWishlist();
  const router = useRouter();

  if (loading && wishlist.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <Header title="Favorites" showCart showMenu />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Favorites" showCart showMenu />
      {wishlist.length > 0 ? (
        <ScrollView
          className="flex-1 px-4 mt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between">
            {wishlist.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyStateCard
            iconName="heart-outline"
            iconColor={COLORS.primary}
            title="Your favorites are empty"
            description="Save products here so you can come back to them later."
            actionLabel="Browse Products"
            onActionPress={() => router.push("/")}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
