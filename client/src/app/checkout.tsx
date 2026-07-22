import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useCart } from "src/context/CartContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Address } from "src/constants/types";
import Toast from "react-native-toast-message";
import { COLORS } from "src/constants";
import Header from "src/components/Header";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";

export default function Checkout() {
  const { getToken } = useAuth();
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const shipping = 2.0;
  const tax = 0.1 * cartTotal;
  const total = cartTotal + shipping + tax;

  const fetchAddress = async () => {
    try {
      setPageLoading(true);
      const token = await getToken();
      const { data } = await api.get("/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const addresses: Address[] = data.data;
      if (addresses.length > 0) {
        const def = addresses.find((address) => address.isDefault);
        if (def) {
          setSelectedAddress(def);
        } else {
          setSelectedAddress(addresses[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching addresses",
        text2: error.message || "An unexpected error occurred.",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "No Address Selected",
        text2: "Please select a shipping address before placing the order.",
      });
      return;
    }
    if (paymentMethod === "stripe") {
      return Toast.show({
        type: "info",
        text1: "Stripe Payment",
        text2: "Stripe payment integration is not implemented yet.",
      });
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: selectedAddress,
        notes: "Placed via mobile app",
        paymentMethod: "cash",
      };
      const token = await getToken();
      const { data } = await api.post("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        await clearCart();
        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: "Your order has been placed successfully.",
        });
        router.replace("/orders");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      Toast.show({
        type: "error",
        text1: "Error placing order",
        text2: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Header title="Checkout" showBack />

      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Shipping Address */}
        <Text className="text-lg font-bold text-primary mb-4">
          Shipping Address
        </Text>
        {selectedAddress ? (
          <View className="bg-white p-4 rounded-xl mb-6 border border-gray-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-primary text-base font-bold">
                {selectedAddress.type}
              </Text>
              <Pressable
                className="flex-row items-center"
                onPress={() => router.push("/addresses")}
              >
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
            <Text className="text-secondary text-sm font-medium">
              {selectedAddress.street}, {selectedAddress.city},{"\n"}
              {selectedAddress.state} - {selectedAddress.zipCode},{" "}
              {selectedAddress.country}
            </Text>
          </View>
        ) : (
          <Pressable
            className="bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100"
            onPress={() => router.push("/addresses")}
          >
            <Ionicons name="add-outline" size={24} color={COLORS.primary} />
            <Text className="text-secondary text-base mt-2">Add Address</Text>
          </Pressable>
        )}

        {/* Payment Method */}
        <Text className="text-lg font-bold text-primary mb-4">
          Payment Method
        </Text>

        {/* Cash on Delivery */}
        <Pressable
          className={`flex-row items-center justify-between mb-4  ${paymentMethod === "cash" ? "bg-gray-100 border-gray-300" : ""} p-4 rounded-xl border border-gray-100`}
          onPress={() => setPaymentMethod("cash")}
        >
          <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-primary text-base font-bold">
              Cash on Delivery
            </Text>
            <Text className="text-secondary text-xs mt-1">
              Pay when you receive the order
            </Text>
          </View>
          {paymentMethod === "cash" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </Pressable>

        {/* Stripe */}
        <Pressable
          className={`flex-row items-center justify-between mb-4  ${paymentMethod === "stripe" ? "bg-gray-100 border-gray-300" : ""} p-4 rounded-xl border border-gray-100`}
          onPress={() => setPaymentMethod("stripe")}
        >
          <Ionicons name="card-outline" size={24} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-primary text-base font-bold">
              Credit / Debit Card
            </Text>
            <Text className="text-secondary text-xs mt-1">
              Pay with your credit or debit card
            </Text>
          </View>
          {paymentMethod === "stripe" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </Pressable>
      </ScrollView>

      {/* Order Summary */}
      <View className="bg-white p-4 border-t border-gray-100 shadow-lg">
        <Text className="text-primary text-base font-bold mb-2">
          Order Summary:
        </Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-secondary text-sm">Subtotal</Text>
          <Text className="text-secondary text-sm">
            ${cartTotal.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-secondary text-sm">Shipping</Text>
          <Text className="text-secondary text-sm">${shipping.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-secondary text-sm">Tax</Text>
          <Text className="text-secondary text-sm">${tax.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
          <Text className="text-primary text-base font-bold">Total</Text>
          <Text className="text-primary text-base font-bold">
            ${total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          className={`py-3 rounded-xl mt-4 items-center justify-center ${loading ? "bg-gray-400" : "bg-primary"}`}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-base font-bold">Place Order</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
