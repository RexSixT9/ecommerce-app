import React from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type EmptyStateCardProps = {
  iconName: IconName;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  onActionPress: () => void;
};

export default function EmptyStateCard({
  iconName,
  iconColor,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateCardProps) {
  return (
    <View className="w-full max-w-sm items-center">
      <View className="w-full min-h-[232px] items-center justify-center rounded-3xl border border-gray-100 bg-surface px-6 py-10">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white">
          <Ionicons name={iconName} size={30} color={iconColor} />
        </View>
        <Text className="text-center text-xl font-bold text-primary">
          {title}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-secondary">
          {description}
        </Text>
      </View>

      <Pressable
        className="mt-6 w-full items-center justify-center rounded-full bg-primary py-3"
        onPress={onActionPress}
      >
        <Text className="text-base font-bold text-white">{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
