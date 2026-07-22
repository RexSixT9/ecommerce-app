import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { Product } from "src/constants/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "src/components/Header";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "src/constants";
import ProductCard from "src/components/ProductCard";
import api from "src/constants/api";
import Toast from "react-native-toast-message";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchProducts = async (page: number = 1, signal?: AbortSignal) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const queryParams: any = {
        limit: 10,
        page: page,
      };
      const { data } = await api.get(`/products`, {
        params: queryParams,
        signal,
      });
      const newProducts = data.data as Product[];

      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      }
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Products",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loadingMore && !loading && hasMore) {
      fetchProducts(page + 1);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchProducts(1, abortController.signal);
    return () => abortController.abort();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Header showBack showCart title="Shop" />
      <View className="flex-row gap-2 mb-3 mx-4 my-2">
        {/* Search Input */}
        <View className="flex-row flex-1 items-center bg-surface/50 rounded-xl border border-surface px-2">
          <Ionicons
            name="search"
            size={20}
            color={COLORS.secondary}
            className="ml-4"
          />
          <TextInput
            placeholder="Search products..."
            className="ml-2 flex-1 px-4 py-3 text-primary"
            returnKeyType="search"
            placeholderTextColor={COLORS.secondary}
          />
        </View>

        {/* Filter Button */}
        <Pressable
          className="bg-primary w-12 h-12 items-center justify-center rounded-xl"
          onPress={() => console.log("Filter button pressed")}
        >
          <Ionicons name="filter" size={20} color="white" />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={6}
          ListFooterComponent={() =>
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={() =>
            !loading && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-secondary text-lg">
                  No products found.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
    </SafeAreaView>
  );
}
