import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItem from "src/components/CartItem";
import Header from "src/components/Header";
import { useCart, CartItem as CartItemType } from "src/context/CartContext";

export default function Cart() {
  const {
    cartItems = [],
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const router = useRouter();

  const shipping = 2.0;
  const total = cartTotal + shipping;

  const handleRemove = useCallback(
    (productId: string, size: string) => removeFromCart(productId, size),
    [removeFromCart],
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, newQuantity: number, size: string) =>
      updateQuantity(productId, newQuantity, size),
    [updateQuantity],
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItemType }) => (
      <CartItem
        item={item}
        onRemove={() => handleRemove(item.productId, item.size)}
        onUpdateQuantity={(newQuantity) =>
          handleUpdateQuantity(item.productId, newQuantity, item.size)
        }
      />
    ),
    [handleRemove, handleUpdateQuantity],
  );

  const keyExtractor = useCallback((item: CartItemType) => item.id, []);

  const ListFooterComponent = useCallback(
    () => (
      <View className="p-4 bg-white rounded-t-3xl shadow-md">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-secondary">Total: </Text>
          <Text className="font-bold text-primary">
            ${cartTotal.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-secondary">Shipping: </Text>
          <Text className="font-bold text-primary">
            ${shipping.toFixed(2)}
          </Text>
        </View>

        <View className="h-[1px] bg-border mb-2" />

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-primary font-bold text-lg">
            Grand Total:{" "}
          </Text>
          <Text className="font-bold text-primary text-lg">
            ${total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          className="bg-primary py-3 rounded-xl mt-4 items-center justify-center"
          onPress={() => router.push("/checkout")}
        >
          <Text className="text-white font-bold text-base">Checkout</Text>
        </Pressable>
      </View>
    ),
    [cartTotal, shipping, total, router],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-lg text-secondary text-center">
          Your cart is empty.
        </Text>
        <Pressable
          className="mt-4 bg-primary py-3 rounded-xl px-6 items-center justify-center"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-bold">Continue Shopping</Text>
        </Pressable>
      </View>
    ),
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showBack title="Cart" />
      <FlatList
        data={cartItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
}
