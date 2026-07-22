import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Address } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";
import Toast from "react-native-toast-message";

export default function Addresses() {
  const { getToken, isSignedIn } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [type, setType] = useState("Home");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      if (!isSignedIn) {
        setAddresses([]);
        return;
      }
      const token = await getToken();
      const { data } = await api.get("/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching addresses",
        text2: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSearch = (item: Address) => {
    setIsEditing(true);
    setEditingId(item._id);
    setType(item.type);
    setStreet(item.street);
    setCity(item.city);
    setState(item.state);
    setZipCode(item.zipCode);
    setCountry(item.country);
    setIsDefault(item.isDefault);
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!street || !city || !state || !zipCode || !country) {
      return Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "All fields are required.",
      });
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = {
        type,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
      };

      let response;
      if (isEditing && editingId) {
        response = await api.put(`/addresses/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await api.post("/addresses", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: isEditing ? "Address Updated" : "Address Added",
          text2: isEditing
            ? "Your address has been updated successfully."
            : "Your address has been added successfully.",
        });
        setModalVisible(false);
        resetForm();
        fetchAddresses();
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      Toast.show({
        type: "error",
        text1: "Error saving address",
        text2: error.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              const { data } = await api.delete(`/addresses/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (data.success) {
                Toast.show({
                  type: "success",
                  text1: "Address Deleted",
                  text2: "The address has been deleted successfully.",
                });
                fetchAddresses();
              }
            } catch (error: any) {
              console.error("Error deleting address:", error);
              Toast.show({
                type: "error",
                text1: "Error deleting address",
                text2: error.message || "An unexpected error occurred.",
              });
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("");
    setType("Home");
    setIsDefault(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Shipping Addresses" showBack />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {addresses.length === 0 ? (
            <Text className="text-center text-secondary mt-10">
              No addresses found
            </Text>
          ) : (
            addresses.map((item) => (
              <View
                key={item._id}
                className="bg-white p-4 rounded-xl mb-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        item.type === "Home"
                          ? "home-outline"
                          : "briefcase-outline"
                      }
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text className="text-base font-bold text-primary ml-2">
                      {item.type}
                    </Text>
                    {item.isDefault && (
                      <View className="bg-primary/10 px-2 py-1 rounded ml-2">
                        <Text className="text-primary text-xs font-bold">
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => handleEditSearch(item)}>
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={COLORS.secondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(item._id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.error || "#ff4444"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-secondary leading-5 ml-7">
                  {item.street}, {item.city}, {item.state} {item.zipCode},{" "}
                  {item.country}
                </Text>
              </View>
            ))
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl mt-2 mb-8"
            onPress={openAddModal}
          >
            <Ionicons name="add" size={24} color={COLORS.secondary} />
            <Text className="text-secondary font-medium ml-2">
              Add New Address
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-primary">
                {isEditing ? "Edit Address" : "Add New Address"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-primary font-medium mb-2">Label</Text>
              <View className="flex-row gap-3 mb-4">
                {["Home", "Work", "Other"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    className={`px-4 py-2 rounded-full border ${type === t ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
                  >
                    <Text
                      className={type === t ? "text-white" : "text-primary"}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-primary font-medium mb-2">
                Street Address
              </Text>
              <TextInput
                className="bg-surface p-4 rounded-xl text-primary mb-4"
                placeholder="123 Main St"
                value={street}
                onChangeText={setStreet}
              />

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-primary font-medium mb-2">City</Text>
                  <TextInput
                    className="bg-surface p-4 rounded-xl text-primary"
                    placeholder="New York"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-medium mb-2">State</Text>
                  <TextInput
                    className="bg-surface p-4 rounded-xl text-primary"
                    placeholder="NY"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-primary font-medium mb-2">
                    Zip Code
                  </Text>
                  <TextInput
                    className="bg-surface p-4 rounded-xl text-primary"
                    placeholder="10001"
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-medium mb-2">Country</Text>
                  <TextInput
                    className="bg-surface p-4 rounded-xl text-primary"
                    placeholder="USA"
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="flex-row items-center mb-8"
                onPress={() => setIsDefault(!isDefault)}
              >
                <View
                  className={`w-5 h-5 border rounded mr-2 items-center justify-center ${isDefault ? "bg-primary border-primary" : "border-gray-300"}`}
                >
                  {isDefault && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text className="text-primary">Set as default address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-primary py-4 rounded-full items-center mb-10"
                onPress={handleSaveAddress}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Save Address
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
