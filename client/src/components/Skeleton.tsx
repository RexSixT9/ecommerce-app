import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/constants";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
};

function SkeletonBlock({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: COLORS.border,
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="w-[48%] mb-4 bg-surface/50 rounded-lg overflow-hidden">
      <SkeletonBlock width="100%" height={192} borderRadius={8} />
      <View className="p-3">
        <View className="flex-row items-center mb-1">
          <SkeletonBlock width={16} height={16} borderRadius={8} />
          <SkeletonBlock width={40} height={12} className="ml-1" />
        </View>
        <SkeletonBlock width="100%" height={14} className="mt-1" />
        <SkeletonBlock width="65%" height={14} className="mt-1" />
        <SkeletonBlock width="35%" height={18} className="mt-2" />
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View className="bg-white p-3 rounded-lg border border-gray-100 mb-3 flex-row items-center">
      <SkeletonBlock width={60} height={60} borderRadius={12} />
      <View className="flex-1 ml-3 gap-2">
        <SkeletonBlock width="70%" height={16} />
        <SkeletonBlock width="50%" height={14} />
        <SkeletonBlock width="30%" height={14} />
      </View>
    </View>
  );
}

export function AddressSkeleton() {
  return (
    <View className="bg-white p-4 rounded-xl mb-4 border border-border">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <SkeletonBlock width={20} height={20} borderRadius={10} />
          <SkeletonBlock width={80} height={16} />
        </View>
        <View className="flex-row gap-3">
          <SkeletonBlock width={20} height={20} borderRadius={10} />
          <SkeletonBlock width={20} height={20} borderRadius={10} />
        </View>
      </View>
      <SkeletonBlock width="90%" height={14} className="ml-7" />
      <SkeletonBlock width="60%" height={14} className="ml-7 mt-1" />
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View className="bg-white p-4 rounded-xl mb-4 border border-border">
      <View className="flex-row justify-between mb-3">
        <SkeletonBlock width={120} height={16} />
        <SkeletonBlock width={80} height={14} />
      </View>
      <View className="flex-row gap-2 mb-3">
        <SkeletonBlock width={60} height={22} borderRadius={999} />
        <SkeletonBlock width={50} height={22} borderRadius={999} />
      </View>
      <View className="flex-row gap-2 mb-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} width={40} height={40} borderRadius={8} />
        ))}
      </View>
      <View className="flex-row justify-between pt-3 border-t border-border">
        <SkeletonBlock width={60} height={14} />
        <SkeletonBlock width={80} height={18} />
      </View>
    </View>
  );
}

export function ProductDetailSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <View className="h-[450px] relative">
        <SkeletonBlock width="100%" height={450} borderRadius={0} />
        <View className="absolute top-10 left-4 right-4 flex-row justify-between items-center z-10">
          <SkeletonBlock width={40} height={40} borderRadius={20} />
          <SkeletonBlock width={40} height={40} borderRadius={20} />
        </View>
        <View className="flex-row justify-center gap-2 absolute bottom-4 left-0 right-0">
          <SkeletonBlock width={24} height={8} borderRadius={4} />
          <SkeletonBlock width={8} height={8} borderRadius={4} />
          <SkeletonBlock width={8} height={8} borderRadius={4} />
        </View>
      </View>
      <View className="px-5 pt-6 gap-4">
        <SkeletonBlock width="75%" height={24} />
        <SkeletonBlock width="30%" height={20} />
        <View className="flex-row gap-3 mb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} width={48} height={48} borderRadius={24} />
          ))}
        </View>
        <SkeletonBlock width="100%" height={14} />
        <SkeletonBlock width="100%" height={14} />
        <SkeletonBlock width="60%" height={14} />
      </View>
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex-row">
        <SkeletonBlock width="80%" height={56} borderRadius={999} />
        <SkeletonBlock width="20%" height={56} />
      </View>
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View className="bg-white p-5 rounded-2xl border border-gray-100 w-[48%] mb-4 justify-center gap-2">
      <SkeletonBlock width="50%" height={28} />
      <SkeletonBlock width="40%" height={12} />
    </View>
  );
}

export function OrderAdminSkeleton() {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
      <View className="flex-row justify-between mb-3">
        <SkeletonBlock width={140} height={14} />
        <SkeletonBlock width={80} height={14} />
      </View>
      <View className="bg-gray-50 p-3 rounded-lg mb-3 gap-2">
        <SkeletonBlock width={60} height={12} />
        <SkeletonBlock width="60%" height={14} />
        <SkeletonBlock width="40%" height={12} />
      </View>
      <View className="bg-gray-50 p-3 rounded-lg mb-3 gap-2">
        <SkeletonBlock width={100} height={12} />
        <SkeletonBlock width="80%" height={14} />
        <SkeletonBlock width="50%" height={14} />
      </View>
      <View className="gap-1 mb-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} className="flex-row justify-between">
            <SkeletonBlock width="60%" height={12} />
            <SkeletonBlock width={50} height={12} />
          </View>
        ))}
      </View>
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <SkeletonBlock width={80} height={20} />
        <SkeletonBlock width={90} height={28} borderRadius={999} />
      </View>
    </View>
  );
}

export function OrderDetailSkeleton() {
  return (
    <View className="px-4 pt-4">
      <View className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm">
        <SkeletonBlock width="50%" height={22} />
        <SkeletonBlock width="35%" height={14} className="mt-2 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} className="flex-row mb-4">
            <View className="items-center mr-4">
              <SkeletonBlock width={12} height={12} borderRadius={6} />
              {i < 3 && <SkeletonBlock width={2} height={24} className="mt-1" />}
            </View>
            <View className="flex-1 gap-1">
              <SkeletonBlock width="60%" height={16} />
              {i === 0 && <SkeletonBlock width="40%" height={12} />}
            </View>
          </View>
        ))}
      </View>

      <View className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm">
        <SkeletonBlock width="35%" height={22} className="mb-4" />
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} className="flex-row mb-4">
            <SkeletonBlock width={64} height={64} borderRadius={8} />
            <View className="flex-1 ml-3 justify-center gap-2">
              <SkeletonBlock width="70%" height={16} />
              <SkeletonBlock width="30%" height={14} />
              <View className="flex-row justify-between">
                <SkeletonBlock width="25%" height={16} />
                <SkeletonBlock width="20%" height={14} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm">
        <SkeletonBlock width="45%" height={22} className="mb-3" />
        <View className="flex-row items-center">
          <SkeletonBlock width={20} height={20} borderRadius={10} />
          <SkeletonBlock width="75%" height={14} className="ml-2" />
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl mb-8 border border-border shadow-sm">
        <SkeletonBlock width="45%" height={22} className="mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} className="flex-row justify-between mb-2">
            <SkeletonBlock width="35%" height={16} />
            <SkeletonBlock width="25%" height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default SkeletonBlock;
