import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { BANNERS } from "@/assets/assets";

export default function Home() {
  const { width } = useWindowDimensions();
  const BANNER_CARD_WIDTH = width - 32;
  const [activeBannerIndex, setActiveBanner] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showMenu showCart showLogo title="Home" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 -mx-4">
          <FlatList
            data={BANNERS}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            bounces={false}
            overScrollMode="never"
            removeClippedSubviews
            style={{ width }}
            contentContainerStyle={{}}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setActiveBanner(Math.max(0, Math.min(index, BANNERS.length - 1)));
            }}
            renderItem={({ item }) => (
              <View
                style={{ width }}
                className="h-48 justify-center"
              >
                <View
                  style={{ width: BANNER_CARD_WIDTH }}
                  className="mx-4 h-48 relative bg-gray-200 overflow-hidden rounded-xl"
                >
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full absolute inset-0"
                    resizeMode="cover"
                  />

                  <View className="absolute inset-0 bg-black/40" />

                  <View className="absolute bottom-4 left-4 right-4 z-10">
                    <Text className="text-white font-bold text-2xl">
                      {item.title}
                    </Text>
                    <Text className="text-white text-sm font-medium mt-1">
                      {item.subtitle}
                    </Text>
                    <View className="mt-2 bg-primary px-4 py-2 rounded-full self-start">
                      <Text className="text-white text-xs font-bold">
                        Get Now
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4 gap-2">
            {BANNERS.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeBannerIndex
                    ? "bg-primary w-6"
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
