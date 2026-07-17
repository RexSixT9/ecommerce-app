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
import { dummyProducts } from "assets/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "src/components/Header";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "src/constants";
import ProductCard from "src/components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchProducts = async (page: number = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const start = (page - 1) * 10;
      const end = start + 10;
      const newProducts = dummyProducts.slice(start, end);
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      }
      setHasMore(end < dummyProducts.length);
      setPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
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
    fetchProducts(1);
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
          renderItem={({ item }) => (
            <ProductCard key={item._id} product={item} />
          )}
        ></FlatList>
      )}
    </SafeAreaView>
  );
}
