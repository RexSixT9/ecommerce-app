import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, Pressable, View, ScrollView, Image } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS, getStatusColor } from "@/constants";
import type { Order, Product } from "@/constants/types";
import EmptyStateCard from "src/components/EmptyStateCard";
import { OrderCardSkeleton } from "src/components/Skeleton";
import {  formatDate } from "@/assets/assets";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";

export default function Orders() {
    const { getToken, isSignedIn } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (signal?: AbortSignal) => {
        if (!isSignedIn) {
            setOrders([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const token = await getToken();
            const {data} = await api.get("/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal,
            });
            if (data.success && data.data) {
                setOrders(data.data);
            } else {
                setOrders([]);
            }
        } catch (error:any) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        fetchOrders(abortController.signal);
        return () => abortController.abort();
    }, [isSignedIn]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <Header title="My Orders" showBack />

            {loading ? (
                <View className="flex-1 pt-4 px-4">
                    <OrderCardSkeleton />
                    <OrderCardSkeleton />
                </View>
            ) : orders.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <EmptyStateCard
                        iconName="lock-closed-outline"
                        iconColor={COLORS.primary}
                        title="Sign in required"
                        description="Please sign in to view your orders and track deliveries."
                        actionLabel="Sign In"
                        onActionPress={() => router.push("/(auth)/sign-in")}
                    />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <Pressable
                            className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm"
                            onPress={() => router.push(`/orders/${item._id}`)}
                            style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
                        >
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-primary font-bold">Order #{item.orderNumber}</Text>
                                <Text className="text-secondary text-sm">{formatDate(item.createdAt)}</Text>
                            </View>

                            {/* Status Badges */}
                            <View className="flex-row gap-2 mb-3">
                                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus)}`}>
                                    <Text className={`text-xs font-bold capitalize`}>
                                        {item.orderStatus}
                                    </Text>
                                </View>

                                <View className={`px-2 py-1 rounded-full ${item.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                    <Text className={`text-xs font-bold capitalize ${item.paymentStatus === 'paid' ? 'text-green-700' : 'text-gray-700'
                                        }`}>
                                        {item.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-secondary text-xs">Payment Method: <Text className="text-primary font-medium capitalize">{item.paymentMethod}</Text></Text>
                            </View>

                            {/* Product Images */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                {item.items.map((prod, idx) => {
                                    const productData = typeof prod.product === "string" ? null : (prod.product as Product);
                                    const image = productData?.images?.[0];
                                    return (
                                        <View key={prod._id ?? productData?._id ?? idx} className="mr-3 border border-border rounded-md p-1 bg-surface">
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    className="w-12 h-12 rounded-md"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-12 h-12 bg-gray-200 rounded-md justify-center items-center">
                                                    <Ionicons name="image-outline" size={20} color={COLORS.secondary} />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-border">
                                <Text className="text-secondary">Items: {item.items.length}</Text>
                                <Text className="text-primary font-bold text-lg">${item.totalAmount.toFixed(2)}</Text>
                            </View>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
