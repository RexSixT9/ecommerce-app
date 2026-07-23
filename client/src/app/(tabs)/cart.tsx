import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItem from "src/components/CartItem";
import Header from "src/components/Header";
import EmptyStateCard from "src/components/EmptyStateCard";
import { COLORS } from "src/constants";
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
        onUpdateQuantity={(newQuantity, size) =>
          handleUpdateQuantity(item.productId, newQuantity, size ?? item.size)
        }
      />
    ),
    [handleRemove, handleUpdateQuantity],
  );

  const keyExtractor = useCallback((item: CartItemType) => item.id, []);

  const ListFooterComponent = useCallback(
    () => (
      <View className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <Text className="text-primary font-bold text-base mb-3">
          Order Summary
        </Text>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-secondary text-sm">Subtotal</Text>
          <Text className="text-sm text-primary">
            ${cartTotal.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-secondary text-sm">Shipping</Text>
          <Text className="text-sm text-primary">
            ${shipping.toFixed(2)}
          </Text>
        </View>

        <View className="h-[1px] bg-border my-2" />

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary font-bold text-lg">Grand Total</Text>
          <Text className="font-bold text-primary text-lg">
            ${total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          className="bg-primary py-3 rounded-full items-center justify-center"
          onPress={() => router.push("/checkout")}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="text-white font-bold text-base">Checkout</Text>
        </Pressable>
      </View>
    ),
    [cartTotal, shipping, total, router],
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <Header title="Cart" showMenu />
        <View className="flex-1 items-center justify-center px-8">
          <EmptyStateCard
            iconName="bag-outline"
            iconColor={COLORS.primary}
            title="Your cart is empty"
            description="Add a few products to see your subtotal, shipping, and checkout actions here."
            actionLabel="Continue Shopping"
            onActionPress={() => router.push("/")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Cart" showMenu />
      <FlatList
        data={cartItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={cartItems.length > 0 ? ListFooterComponent : null}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 96,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
}
