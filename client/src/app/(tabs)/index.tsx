import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { BANNERS } from "@/assets/assets";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

export default function Home() {
  const router = useRouter();
  const [activeBannerIndex, setActiveBanner] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header showMenu showCart showLogo title="Home" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4">
          <ScrollView
            className="w-full h-48 rounded-xl"
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            horizontal
            snapToInterval={BANNER_WIDTH}
            decelerationRate="fast"
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / BANNER_WIDTH,
              );
              if (index !== activeBannerIndex) setActiveBanner(index);
            }}
            scrollEventThrottle={16}
          >
            {BANNERS.map((banner, index) => (
              <View
                key={banner.id}
                style={{ width: BANNER_WIDTH }}
                className="h-48 relative bg-gray-200 overflow-hidden rounded-xl"
              >
                <Image
                  source={{ uri: banner.image }}
                  className="w-full h-full absolute inset-0"
                  resizeMode="cover"
                />

                {/* Overlay MUST be above the text in the code so it renders behind it */}
                <View className="absolute inset-0 bg-black/40" />

                <View className="absolute bottom-4 left-4 right-4 z-10">
                  <Text className="text-white font-bold text-2xl">
                    {banner.title}
                  </Text>
                  <Text className="text-white text-sm font-medium mt-1">
                    {banner.subtitle}
                  </Text>
                  <TouchableOpacity className="mt-2 bg-primary px-4 py-2 rounded-full self-start">
                    <Text className="text-white text-xs font-bold">
                      Get Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

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
