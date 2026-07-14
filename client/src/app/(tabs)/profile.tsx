import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-primary">Profile</Text>
        <Text className="mt-2 text-center text-secondary">
          Account details and preferences will live here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
