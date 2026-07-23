import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, getStatusColor } from "@/constants";
import Toast from "react-native-toast-message";
import { useAuth } from "@clerk/expo/";
import { StatCardSkeleton, OrderAdminSkeleton } from "src/components/Skeleton";
import api from "src/constants/api";
import type { Order } from "@/constants/types";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [] as Order[],
  });

  const fetchStats = async (signal?: AbortSignal) => {
    try {
      const token = await getToken();
      const { data } = await api.get("/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Dashboard",
        text2: "Something went wrong",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchStats(abortController.signal);
    return () => abortController.abort();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats().catch((error) => {
      console.error("Error refreshing admin stats:", error);
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap justify-between">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </View>
          <View className="mt-6">
            <OrderAdminSkeleton />
            <OrderAdminSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
    <ScrollView
      className="flex-1 px-4 pt-4 pb-8"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="mb-8">
        <Text className="text-primary font-bold text-2xl mb-4 tracking-tight">
          Overview
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
          />
          <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
          <StatCard label="Products" value={stats.totalProducts.toString()} />
          <StatCard label="Users" value={stats.totalUsers.toString()} />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-primary font-bold text-2xl mb-4 tracking-tight">
          Recent Orders
        </Text>
        {stats.recentOrders.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-border items-center">
            <Text className="text-secondary">No recent orders</Text>
          </View>
        ) : (
          stats.recentOrders.map((order) => (
            <View
              key={order._id}
              className="bg-white p-5 rounded-xl border border-border shadow-sm mb-4"
            >
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className="font-bold text-primary text-base">
                    Total Products :{" "}
                    {order.items.reduce(
                      (acc: number, item) => acc + item.quantity,
                      0,
                    )}
                  </Text>
                  <Text className="text-secondary text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  className={`px-4 py-2 rounded-full ${getStatusColor(order.orderStatus)}`}
                >
                  <Text className="text-[10px] font-bold uppercase">
                    {order.orderStatus}
                  </Text>
                </View>
              </View>
              <View className="pb-2">
                {order.items.map((item) => (
                  <Text key={item._id} className="text-secondary text-xs mt-1">
                    {item.name} x {item.quantity}
                  </Text>
                ))}
              </View>

              <View className="h-px bg-gray-100 mb-3" />

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-2">
                    <Text className="text-primary font-bold text-xs">
                      {(typeof order.user === "object" && order.user?.name ? order.user.name : "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-secondary text-sm">
                    {typeof order.user === "object" && order.user?.name ? order.user.name : "Unknown User"}
                  </Text>
                </View>
                <Text className="text-primary font-bold text-lg">
                  ${order.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View className="bg-white p-5 rounded-xl border border-border shadow-sm w-[48%] mb-4 justify-center">
    <Text className="text-xl font-bold text-primary mb-1">{value}</Text>
    <Text className="text-secondary text-xs font-medium uppercase tracking-wide">
      {label}
    </Text>
  </View>
);
