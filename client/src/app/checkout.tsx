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
import { dummyAddress } from "assets/assets";
import Toast from "react-native-toast-message";
import { COLORS } from "src/constants";
import Header from "src/components/Header";
import { Ionicons } from "@react-native-vector-icons/ionicons";

export default function Checkout() {
  const { cartTotal } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const shipping = 2.0;
  const tax = 0.1 * cartTotal;
  const total = cartTotal + shipping + tax;

  const fetchAddress = async () => {
    const addressList = dummyAddress; // Replace with actual API call to fetch addresses
    if (addressList.length > 0) {
      const defaultAddress = addressList.find(
        (address: any) => address.isDefault || addressList[0],
      );
      setSelectedAddress(defaultAddress as Address);
    }
    setPageLoading(false);
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
      Toast.show({
        type: "info",
        text1: "Stripe Payment",
        text2: "Stripe payment integration is not implemented yet.",
      });
    }

    router.replace("/orders");
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
              <Text className="text-secondary text-base font-bold">
                {selectedAddress.type}
              </Text>
              <Pressable
                className="flex-row items-center"
                onPress={() => router.push("/addresses")}
              >
                <Text className="text-accent text-sm">Change</Text>
              </Pressable>
            </View>
            <Text className="text-secondary text-sm">
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
            <Text className="text-secondary text-base mt-2">Add Address</Text>
          </Pressable>
        )}

        {/* Payment Method */}
        <Text className="text-lg font-bold text-primary mb-4">
          Payment Method
        </Text>
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => setPaymentMethod("stripe")}
        >
          <Ionicons name="card-outline" size={24} color={COLORS.primary} />
          <Text className="text-secondary text-base">Stripe</Text>
          {paymentMethod === "stripe" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </Pressable>
        <Pressable
          className="flex-row items-center justify-between mt-4"
          onPress={() => setPaymentMethod("cash")}
        >
          <Text className="text-secondary text-base">Cash on Delivery</Text>
          <Text className="text-secondary text-sm">
            (Pay when you receive the order)
          </Text>
          {paymentMethod === "cash" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
