import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";

export default function Favorites() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showBack />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-primary">
          No favorites yet
        </Text>
        <Text className="mt-2 text-center text-secondary">
          Tap the heart on a product to save it for later.
        </Text>
      </View>
    </SafeAreaView>
  );
}
