import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItem from "src/components/CartItem";
import Header from "src/components/Header";
import { useCart } from "src/context/CartContext";

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showBack title="Cart" />

      {cartItems.length > 0 ? (
        <>
          <ScrollView
            className="flex-1 px-4 mt-4"
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item, index) => (
              <CartItem
                item={item}
                key={index}
                onRemove={() => removeFromCart(item.id, item.size)}
                onUpdateQuantity={(newQuantity) =>
                  updateQuantity(item.id, newQuantity, item.size)
                }
              />
            ))}
          </ScrollView>

          <View className="p-4 bg-white rounded-t-3xl shadow-md">
            {/* Total */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-secondary">Total: </Text>
              <Text className="font-bold text-primary">
                ${cartTotal.toFixed(2)}
              </Text>
            </View>

            {/* Shipping */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-secondary">Shipping: </Text>
              <Text className="font-bold text-primary">
                ${shipping.toFixed(2)}
              </Text>
            </View>

            <View className="h-[1px] bg-border mb-2" />

            {/* Grand Total */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-primary font-bold text-lg">
                Grand Total:{" "}
              </Text>
              <Text className="font-bold text-primary text-lg">
                ${total.toFixed(2)}
              </Text>
            </View>

            {/* Check out */}
            <Pressable
              className="bg-primary py-3 rounded-xl mt-4 items-center justify-center"
              onPress={() => router.push("/checkout")}
            >
              <Text className="text-white font-bold text-base">Checkout</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
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
      )}
    </SafeAreaView>
  );
}
