import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Pressable,
  View,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { COLORS } from "@/constants";
import { useAuth } from "@clerk/expo";
import { ListItemSkeleton } from "src/components/Skeleton";
import api from "src/constants/api";
import Toast from "react-native-toast-message";
import type { Banner } from "@/constants/types";

export default function AdminBanners() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = async (signal?: AbortSignal) => {
    try {
      const token = await getToken();
      const { data } = await api.get("/banners", {
        params: { showAll: "true" },
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching banners:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Fetch Banners",
        text2: "Something went wrong",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchBanners(abortController.signal);
    return () => abortController.abort();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBanners();
  };

  const performDelete = async (id: string) => {
    try {
      const token = await getToken();
      const { data } = await api.delete(`/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Banner Deleted",
          text2: "The banner has been deleted successfully",
        });
        fetchBanners();
      }
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Delete Banner",
        text2: "Something went wrong",
      });
    }
  };

  const deleteBanner = (id: string) => {
    Alert.alert("Delete Banner", "Are you sure you want to delete this banner?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => performDelete(id),
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-4">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="p-4 bg-white border-b border-border flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-primary">
          Total Banners ({banners.length}/5)
        </Text>
        <Pressable
          onPress={() => router.push("/admin/banners/add" as any)}
          className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-1">Add Banner</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {banners.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-secondary">No banners found</Text>
          </View>
        ) : (
          banners.map((banner) => (
            <View
              key={banner._id}
              className="bg-white p-3 rounded-xl border border-border mb-3 flex-row items-center"
            >
              <Image
                source={{ uri: banner.image }}
                className="w-20 h-14 rounded-lg bg-gray-100 mr-3"
                resizeMode="cover"
              />

              <View className="flex-1">
                <Text className="font-bold text-primary text-base" numberOfLines={1}>
                  {banner.title}
                </Text>
                {banner.subtitle && (
                  <Text className="text-secondary text-xs" numberOfLines={1}>
                    {banner.subtitle}
                  </Text>
                )}
                <View className="flex-row items-center mt-1">
                  <View
                    className={`px-2 py-0.5 rounded-full ${banner.isActive ? "bg-green-100" : "bg-surface"}`}
                  >
                    <Text
                      className={`text-xs font-bold ${banner.isActive ? "text-green-700" : "text-secondary"}`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <Text className="text-secondary text-xs ml-2">
                    Order: {banner.order}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Pressable
                    onPress={() => router.push(`/admin/banners/edit/${banner._id}` as any)}
                  className="p-2 bg-surface rounded-full mr-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Ionicons name="create-outline" size={18} color="#333333" />
                </Pressable>
                <Pressable
                  onPress={() => deleteBanner(banner._id)}
                  className="p-2 bg-surface rounded-full"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Ionicons name="trash-outline" size={18} color="#333333" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
