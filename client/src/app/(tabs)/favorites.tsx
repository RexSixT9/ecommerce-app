import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { useWishlist } from "src/context/WishlistContext";
import { useRouter } from "expo-router";
import ProductCard from "src/components/ProductCard";

export default function Favorites() {
  const { wishlist } = useWishlist();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Favorites" showMenu showCart />
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
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-secondary">
            You have no favorite items.
          </Text>
          <Pressable
            className="bg-primary py-2 px-4 rounded-full mt-4"
            onPress={() => router.push("/")}
          >
            <Text className="text-white text-lg">Browse Products</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
