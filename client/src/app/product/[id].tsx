import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  LayoutAnimation,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product } from "src/constants/types";
import { useCart } from "src/context/CartContext";
import { useWishlist } from "src/context/WishlistContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "src/constants";
import Ionicons from "@react-native-vector-icons/ionicons";
import Toast from "react-native-toast-message";
import { ProductDetailSkeleton } from "src/components/Skeleton";
import api from "src/constants/api";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { addToCart, itemCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const fetchProductDetails = async (signal?: AbortSignal) => {
    try {
      const { data } = await api.get(`/products/${id}`, { signal });
      if (data.success) {
        setProduct(data.data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Fetch Product",
        text2: "Something went wrong",
      });
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchProductDetails(abortController.signal);
    return () => abortController.abort();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const isLiked = isInWishlist(product._id);
  const productImages = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.images
      ? [product.images]
      : [];
  const productSizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];

  const handleAddToCart = (product: Product) => {
    if (!selectedSize) {
      Toast.show({
        type: "info",
        text1: "Please select a size before adding to cart.",
        text2: "You can select a size from the available options.",
      });
      return;
    }
    addToCart(product, selectedSize || "");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Carousel */}
        <View className="h-[450px] bg-gray-100 relative mb-6">
          <ScrollView
            pagingEnabled={true}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const slide = Math.ceil(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width,
              );
              if (slide !== activeImageIndex) {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setActiveImageIndex(slide);
              }
            }}
          >
            {(productImages.length > 0 ? productImages : ["https://via.placeholder.com/900x900"]).map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: width, height: 450 }}
                className="w-full h-96"
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Header Section */}
          <View className="absolute top-10 left-4 right-4 flex-row justify-between items-center z-10">
            <Pressable
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </Pressable>
            <Pressable
              onPress={() => toggleWishlist(product)}
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center"
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.accent : COLORS.primary}
              />
            </Pressable>
          </View>

          {/* Pagination Dots */}
          <View className="flex-row justify-center gap-2 absolute bottom-4 left-0 right-0 z-10">
            {productImages.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeImageIndex
                    ? "bg-primary w-6"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View className="px-5">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-primary flex-1 mr-4">
              {product.name}
            </Text>
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-sm text-secondary font-semibold ml-1">
                {product.ratings.average}
              </Text>
              <Text className="text-xs text-secondary ml-1">
                ({product.ratings.count})
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text className="text-xl text-gray-600 mb-6 font-semibold">
            ${product.price.toFixed(2)}
          </Text>

          {/* Size */}
          {productSizes.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-bold text-primary mb-3">
                Size
              </Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                {productSizes.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full items-center justify-center border ${selectedSize === size ? "border-primary bg-primary" : "border-gray-100 bg-white"}`}
                  >
                    <Text
                      className={`text-sm font-medium ${selectedSize === size ? "text-white" : "text-primary"}`}
                    >
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-bold text-primary mb-2">
              Description
            </Text>
            <Text className="text-sm text-secondary leading-5 mb-6">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer for Add to Cart Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex-row">
        <Pressable
          className="w-4/5 bg-primary py-4 rounded-full flex-row items-center justify-center shadow-md"
          onPress={() => {
            handleAddToCart(product);
          }}
        >
          <Ionicons name="bag-outline" size={20} color="white" />
          <Text className="text-white text-base font-bold ml-2">
            Add to Cart
          </Text>
        </Pressable>

        <Pressable
          className="w-1/5 py-3 flex-row justify-center relative"
          onPress={() => router.push("/(tabs)/cart")}
        >
          <Ionicons name="cart-outline" size={24} />
          <View className="absolute top-2 right-4 bg-primary rounded-full size-4 items-center justify-center z-10">
            <Text className="text-white text-xs">{itemCount}</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
