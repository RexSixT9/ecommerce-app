import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { CATEGORIES } from "@/constants";
import CategoryItem from "@/components/CategoryItem";
import { router } from "expo-router";
import { Product, Banner } from "@/constants/types";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import api from "src/constants/api";
import Toast from "react-native-toast-message";

export default function Home() {
  const { width } = useWindowDimensions();
  const BANNER_CARD_WIDTH = width - 32;
  const [activeBannerIndex, setActiveBanner] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [{ id: "all", name: "All", icon: "grid" }, ...CATEGORIES];

  const fetchBanners = async (signal?: AbortSignal) => {
    try {
      setBannerLoading(true);
      const { data } = await api.get("/banners", { signal });
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error: any) {
      if (error.name !== "CanceledError") {
        console.error("Failed to fetch banners:", error);
      }
    } finally {
      setBannerLoading(false);
    }
  };

  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      const { data } = await api.get("/products", {
        params: {
          limit: 4,
        },
        signal,
      });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Products",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const abortController = new AbortController();
    fetchBanners(abortController.signal);
    fetchProducts(abortController.signal);
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveBanner(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBannerIndex, banners.length]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showMenu showCart showLogo title="Home" />

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Banners */}
        {bannerLoading ? (
          <View className="bg-surface/50 h-48 rounded-xl mb-4" />
        ) : banners.length > 0 ? (
          <View className="-mx-4">
            <FlatList
              ref={flatListRef}
              data={banners}
              keyExtractor={(item) => item._id}
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
                setActiveBanner(Math.max(0, Math.min(index, banners.length - 1)));
              }}
              onScrollToIndexFailed={(info) => {
                flatListRef.current?.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }}
              renderItem={({ item }) => (
                <Pressable
                  style={{ width }}
                  className="h-48 justify-center"
                  onPress={() => {
                    if (item.link) router.push(item.link as any);
                  }}
                >
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
                      {item.subtitle && (
                        <Text className="text-white text-sm font-medium mt-1">
                          {item.subtitle}
                        </Text>
                      )}
                      {item.link && (
                        <View className="mt-2 bg-white px-4 py-2 rounded-full self-start">
                          <Text className="text-primary text-xs font-bold">
                            Get Now
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              )}
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center mt-4 gap-2">
              {banners.map((_, index) => (
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
        ) : null}

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
            <ProductGridSkeleton count={4} />
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
