import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, getStatusColor } from "@/constants";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "@clerk/expo";
import { OrderAdminSkeleton } from "src/components/Skeleton";
import api from "src/constants/api";
import Toast from "react-native-toast-message";
import type { Order } from "@/constants/types";

export default function AdminOrders() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Status Modal State
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const STATUSES = [
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const fetchOrders = async (signal?: AbortSignal) => {
    try {
      const token = await getToken();
      const { data } = await api.get("/orders/admin/all", {
        params: { limit: 1000 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Fetch Orders",
        text2: "Something went wrong",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchOrders(abortController.signal);
    return () => abortController.abort();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const token = await getToken();
      const { data } = await api.put(
        `/orders/${selectedOrder._id}/status`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Order Status Updated",
          text2: `Order status has been updated to ${newStatus}`,
        });
        setStatusModalVisible(false);
        fetchOrders();
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Update Status",
          text2: "Something went wrong",
        });
      }
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Update Status",
        text2: "Something went wrong",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-4">
          <OrderAdminSkeleton />
          <OrderAdminSkeleton />
          <OrderAdminSkeleton />
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
        {orders.length === 0 ? (
          <View className="min-h-[400px] justify-center items-center">
            <Text className="text-secondary">No orders found</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View
              key={order._id}
              className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-border"
            >
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium text-sm text-secondary">
                  Order ID : #{order._id}
                </Text>
                <Text className="text-secondary text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View className="mb-3 bg-surface p-3 rounded-lg">
                <Text className="text-xs text-secondary font-bold mb-1">
                  CUSTOMER
                </Text>
                <Text className="text-primary font-medium">
                  {typeof order.user === "object" && order.user ? order.user.name : "Unknown User"}
                </Text>
                <Text className="text-secondary text-xs">
                  {typeof order.user === "object" && order.user ? order.user.email : "No email"}
                </Text>
                {typeof order.user !== "object" && (
                  <Text className="text-xs text-secondary mt-1">
                    ID: {order.user || "N/A"}
                  </Text>
                )}
              </View>

              <View className="mb-3 bg-surface p-3 rounded-lg">
                <Text className="text-xs text-secondary font-bold mb-1">
                  SHIPPING ADDRESS
                </Text>
                <Text className="text-primary text-xs">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}
                </Text>
                <Text className="text-primary text-xs">
                  {order.shippingAddress?.state},{" "}
                  {order.shippingAddress?.zipCode},{" "}
                  {order.shippingAddress?.country}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-xs text-secondary font-bold mb-2">
                  ITEMS
                </Text>
                {order.items.map((item) => (
                  <View
                    key={item._id}
                    className="flex-row justify-between mb-1"
                  >
                    <Text className="text-secondary text-xs flex-1">
                      {item.quantity}x {typeof item.product === "object" && item.product ? item.product.name : item.name}
                      {item.size && (
                        <Text className="text-secondary">
                          {" "}
                          ({item.size || "-"})
                        </Text>
                      )}
                    </Text>
                    <Text className="text-secondary text-xs font-bold">
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-border">
                <Text className="text-primary font-bold text-lg">
                  ${order.totalAmount.toFixed(2)}
                </Text>

                <TouchableOpacity
                  onPress={() => openStatusModal(order)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${getStatusColor(order.orderStatus)}`}
                >
                  <Text className="text-xs font-bold mr-2 uppercase tracking-wide">
                    {order.orderStatus}
                  </Text>
                  <Ionicons
                    name="pencil"
                    size={12}
                    color="black"
                    style={{ opacity: 0.5 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* STATUS MODAL */}
      <Modal visible={statusModalVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setStatusModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-xl p-4 max-h-[60%]">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
                <Text className="text-lg font-bold text-primary">
                  Update Order Status
                </Text>
                <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              {updating ? (
                <View className="py-8">
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text className="text-center text-secondary mt-2">
                    Updating status...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={STATUSES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`p-4 rounded-xl mb-2 flex-row justify-between items-center ${
                        selectedOrder?.orderStatus === item
                          ? "bg-primary/10"
                          : "bg-surface"
                      }`}
                      onPress={() => updateStatus(item)}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          selectedOrder?.orderStatus === item
                            ? "text-primary font-bold"
                            : "text-secondary"
                        }`}
                      >
                        {item}
                      </Text>
                      {selectedOrder?.orderStatus === item && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
