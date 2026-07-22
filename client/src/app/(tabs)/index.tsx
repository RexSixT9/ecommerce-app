import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { BANNERS } from "@/assets/assets";
import { CATEGORIES } from "@/constants";
import CategoryItem from "@/components/CategoryItem";
import { router } from "expo-router";
import { Product } from "@/constants/types";
import ProductCard from "@/components/ProductCard";
import api from "src/constants/api";

export default function Home() {
  const { width } = useWindowDimensions();
  const BANNER_CARD_WIDTH = width - 32;
  const [activeBannerIndex, setActiveBanner] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [{ id: "all", name: "All", icon: "grid" }, ...CATEGORIES];

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products", {
        params: {
          limit: 4,
        },
      });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showMenu showCart showLogo title="Home" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Banners */}
        <View className="mt-4 -mx-4">
          <FlatList
            data={BANNERS}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            bounces={false}
            overScrollMode="never"
            removeClippedSubviews
            style={{ width }}
            contentContainerStyle={{}}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setActiveBanner(Math.max(0, Math.min(index, BANNERS.length - 1)));
            }}
            renderItem={({ item }) => (
              <View style={{ width }} className="h-48 justify-center">
                <View
                  style={{ width: BANNER_CARD_WIDTH }}
                  className="mx-4 h-48 relative bg-gray-200 overflow-hidden rounded-xl"
                >
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full absolute inset-0"
                    resizeMode="cover"
                  />

                  <View className="absolute inset-0 bg-black/40" />

                  <View className="absolute bottom-4 left-4 right-4 z-10">
                    <Text className="text-white font-bold text-2xl">
                      {item.title}
                    </Text>
                    <Text className="text-white text-sm font-medium mt-1">
                      {item.subtitle}
                    </Text>
                    <View className="mt-2 bg-white px-4 py-2 rounded-full self-start">
                      <Text className="text-primary text-xs font-bold">
                        Get Now
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4 gap-2">
            {BANNERS.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeBannerIndex
                    ? "bg-primary w-6"
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-primary">Categories</Text>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CategoryItem
                item={item}
                isSelected={false}
                onPress={() => {
                  router.push({
                    pathname: `/shop`,
                    params: { category: item.id == "all" ? "" : item.id },
                  });
                }}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Popular Products */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-primary">
              Popular Products
            </Text>
            <Pressable onPress={() => router.push("/shop")}>
              <Text className="text-secondary text-sm font-medium">
                See All
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </View>
          )}
        </View>

        {/* Newsletter CTA */}
        <View className="bg-gray-100 p-6 rounded-xl items-center justify-center mb-6">
          <Text className="text-lg font-bold text-primary mb-2">
            Subscribe to our Newsletter
          </Text>
          <Text className="text-gray-600 text-sm mb-4">
            Get the latest updates and offers directly in your inbox.
          </Text>
          <TouchableOpacity className="bg-primary py-3 px-6 rounded-full">
            <Text className="text-white font-bold text-center">Subscribe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
