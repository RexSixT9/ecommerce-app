import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import Toast from "react-native-toast-message";
import { COLORS, CATEGORIES } from "@/constants";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";

export default function AddProduct() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Men");
  const [sizes, setSizes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  // PICK MULTIPLE IMAGES (MAX 5)
  const pickImages = async () => {
    if (images.length >= 5) {
      Toast.show({
        type: "error",
        text1: "Image Limit Reached",
        text2: "You can upload up to 5 product images.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 5 - images.length),
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = (result.assets ?? []).map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || !category || sizes.length < 1) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all required fields",
      });
      return;
    }
    if (images.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing Images",
        text2: "Please select at least one product image.",
      });
      return;
    }
    try {
      setSubmitting(true);
      const token = await getToken();
      const formData = new FormData();

      // Append form fields to FormData
      const fields = {
        name,
        description,
        price,
        stock: stock || "0",
        category,
        sizes,
        isFeatured: isFeatured.toString(),
      };
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append images to FormData
      for (const [i, url] of images.entries()) {
        const fileName = `image_${i}.jpg`;
        if (Platform.OS === "web") {
          const blob = await (await fetch(url)).blob();
          formData.append(
            "images",
            new File([blob], fileName, { type: "image/jpeg" }),
          );
        } else {
          formData.append("images", {
            uri: url,
            name: fileName,
            type: "image/jpeg",
          } as any);
        }
      }

      const { data } = await api.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data?.success) {
        throw new Error(data.message || "Failed to create product");
      }
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product created successfully!",
        });
        router.replace("/admin/products");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to create product. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface p-4">
      <View className="bg-white p-4 rounded-xl shadow-sm mb-20">
        {/* NAME */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Product Name *
        </Text>
        <TextInput
          className="bg-surface p-3 rounded-lg mb-4 text-primary"
          placeholder="e.g. Wireless Headphones"
          value={name}
          onChangeText={setName}
        />

        {/* PRICE */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Price ($) *
        </Text>
        <TextInput
          className="bg-surface p-3 rounded-lg mb-4 text-primary"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
        />

        {/* CATEGORY */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Category
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-surface p-3 rounded-lg mb-4 flex-row justify-between items-center"
        >
          <Text className="text-primary">{category}</Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        {/* CATEGORY MODAL */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-2xl p-4 max-h-[50%]">
                <Text className="text-lg font-bold text-center mb-4">
                  Select Category
                </Text>

                <FlatList
                  data={CATEGORIES}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`p-4 border-b ${
                        category === item.name ? "bg-primary/5" : ""
                      }`}
                      onPress={() => {
                        setCategory(item.name);
                        setModalVisible(false);
                      }}
                    >
                      <View className="flex-row justify-between">
                        <Text
                          className={`${
                            category === item.name
                              ? "font-bold text-primary"
                              : ""
                          }`}
                        >
                          {item.name}
                        </Text>
                        {category === item.name && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={COLORS.primary}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* STOCK */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Stock Level
        </Text>
        <TextInput
          className="bg-surface p-3 rounded-lg mb-4 text-primary"
          placeholder="0"
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        {/* SIZES */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Sizes (comma separated)
        </Text>
        <TextInput
          className="bg-surface p-3 rounded-lg mb-4 text-primary"
          placeholder="e.g. S, M, L, XL"
          value={sizes}
          onChangeText={setSizes}
        />

        {/* IMAGE PICKER */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Product Images (max 5)
        </Text>

        <TouchableOpacity onPress={pickImages} className="mb-4">
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  className="w-32 h-32 rounded-lg mr-2"
                />
              ))}
            </ScrollView>
          ) : (
            <View className="w-full h-32 rounded-lg bg-gray-100 justify-center items-center border border-dashed border-gray-300">
              <Ionicons
                name="cloud-upload-outline"
                size={32}
                color={COLORS.secondary}
              />
              <Text className="text-secondary text-xs mt-2">
                Tap to upload images
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Description
        </Text>
        <TextInput
          className="bg-surface p-3 rounded-lg mb-6 text-primary h-24"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* FEATURED */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-primary font-bold">Featured Product</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#eee", true: COLORS.primary }}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className={`bg-primary p-4 rounded-xl items-center ${
            submitting ? "opacity-70" : ""
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
