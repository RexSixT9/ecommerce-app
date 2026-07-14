import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cart() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-primary">Your cart is empty</Text>
        <Text className="mt-2 text-center text-secondary">
          Start adding products from the home screen to see them here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
