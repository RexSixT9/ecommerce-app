import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { COLORS, CATEGORIES } from "@/constants";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import SkeletonBlock from "src/components/Skeleton";
import * as ImagePicker from "expo-image-picker";
import api from "src/constants/api";
import { useAuth } from "@clerk/expo";

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Image State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ uri: string; mimeType: string }[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (data.success) {
          const product = data.data;
          setName(product.name);
          setDescription(product.description || "");
          setPrice(product.price.toString());
          setStock(product.stock.toString());
          setCategory(
            typeof product.category === "object"
              ? product.category.name
              : product.category,
          );
          setIsFeatured(product.isFeatured);

          if (product.sizes)
            setSizes(
              Array.isArray(product.sizes)
                ? product.sizes.join(", ")
                : product.sizes,
            );

          if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images);
          } else if (product.images) {
            setExistingImages([product.images]);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch product:", error);
        Toast.show({
          type: "error",
          text1: "Failed to Fetch Product",
          text2: error.response?.data?.message || "Something went wrong",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const pickImages = async () => {
    const remainingSlots = 5 - (existingImages.length + newImages.length);
    if (remainingSlots <= 0) {
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
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAssets = (result.assets ?? []).map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
      }));
      setNewImages((prev) => [...prev, ...newAssets].slice(0, 5 - existingImages.length));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((current) => current.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((current) => current.filter((_, i) => i !== index));
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

    try {
      setSubmitting(true);
      const token = await getToken();
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      formData.append("isFeatured", String(isFeatured));
      formData.append("sizes", sizes);

      // Append existing images
      existingImages.forEach((img) => {
        formData.append("existingImages", img);
      });

      // Append new images
      for (const [i, img] of newImages.entries()) {
        const ext = img.mimeType.split("/")[1] || "jpg";
        const filename = `new-image-${i}.${ext}`;
        if (Platform.OS === "web") {
          const blob = await (await fetch(img.uri)).blob();
          formData.append(
            "images",
            new File([blob], filename, { type: img.mimeType }),
          );
        } else {
          formData.append("images", {
            uri: img.uri,
            name: filename,
            type: img.mimeType,
          } as any);
        }
      }

      const { data } = await api.put(`/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data?.success) {
        throw new Error(data.message || "Failed to update product");
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Product updated successfully!",
      });
      router.replace("/admin/products");
    } catch (error: any) {
      console.error("Failed to update product:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Update Product",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-4 pt-4">
          <View className="gap-4">
            <SkeletonBlock height={50} />
            <SkeletonBlock height={50} />
            <SkeletonBlock height={50} />
            <SkeletonBlock height={50} />
            <SkeletonBlock height={100} />
            <SkeletonBlock height={50} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
    <ScrollView className="flex-1 px-4 pt-4 pb-8">
      <View className="bg-white p-4 rounded-xl border border-border mb-20">
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Product Name *
        </Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="e.g. Wireless Headphones"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Price ($) *
        </Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
        />

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Stock Level
        </Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="0"
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Sizes (comma separated)
        </Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="e.g. S, M, L"
          value={sizes}
          onChangeText={setSizes}
        />

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Category
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-surface p-4 rounded-xl mb-4 flex-row justify-between items-center"
        >
          <Text className="text-primary">{category || "Select Category"}</Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-xl p-4 max-h-[50%]">
                <Text className="text-lg font-bold text-center mb-4">
                  Select Category
                </Text>
                <FlatList
                  data={CATEGORIES}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`p-4 border-b ${category === item.name ? "bg-primary/5" : ""}`}
                      onPress={() => {
                        setCategory(item.name);
                        setModalVisible(false);
                      }}
                    >
                      <View className="flex-row justify-between">
                        <Text
                          className={`${category === item.name ? "font-bold text-primary" : ""}`}
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

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Images
        </Text>
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((uri, index) => (
              <View key={`existing-${index}`} className="relative mr-2">
                <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                <TouchableOpacity
                  onPress={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((img, index) => (
              <View key={`new-${index}`} className="relative mr-2">
                <Image
                  source={{ uri: img.uri }}
                  className="w-24 h-24 rounded-lg border-2 border-primary"
                />
                <TouchableOpacity
                  onPress={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-primary rounded-full p-1"
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {existingImages.length + newImages.length < 5 && (
              <TouchableOpacity
                onPress={pickImages}
                className="w-24 h-24 rounded-lg bg-surface justify-center items-center border border-dashed border-border"
              >
                <Ionicons name="add" size={24} color={COLORS.secondary} />
                <Text className="text-xs text-secondary mt-1">Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <Text className="text-secondary text-xs font-bold mb-1 uppercase">
          Description
        </Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-6 text-primary h-24"
          multiline
          textAlignVertical="top"
          placeholder="e.g. A comfortable cotton t-shirt with modern fit"
          value={description}
          onChangeText={setDescription}
        />

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-primary font-bold">Featured Product</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#eee", true: COLORS.primary }}
          />
        </View>

        <TouchableOpacity
          className={`bg-primary py-4 rounded-full items-center ${submitting ? "opacity-70" : ""}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium text-lg">
              Update Product
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
