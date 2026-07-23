import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
  Switch,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { COLORS } from "@/constants";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";

export default function AddBanner() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const [image, setImage] = useState<{ uri: string; mimeType: string } | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType || "image/jpeg" });
    }
  };

  const onStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) setEndDate(selectedDate);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!image) {
      Toast.show({ type: "error", text1: "Missing Image", text2: "Please select a banner image." });
      return;
    }
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Missing Title", text2: "Banner title is required." });
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      const formData = new FormData();

      const fileName = `banner.${image.mimeType.split("/")[1] || "jpg"}`;
      if (Platform.OS === "web") {
        const blob = await (await fetch(image.uri)).blob();
        formData.append("image", new File([blob], fileName, { type: image.mimeType }));
      } else {
        formData.append("image", {
          uri: image.uri,
          name: fileName,
          type: image.mimeType,
        } as any);
      }

      formData.append("title", title.trim());
      if (subtitle) formData.append("subtitle", subtitle.trim());
      if (link) formData.append("link", link);
      formData.append("isActive", isActive.toString());
      if (order) formData.append("order", order);
      if (startDate) formData.append("startDate", startDate.toISOString());
      if (endDate) formData.append("endDate", endDate.toISOString());

      const { data } = await api.post("/banners", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.success) {
        throw new Error(data.message || "Failed to create banner");
      }

      Toast.show({ type: "success", text1: "Success", text2: "Banner created successfully!" });
      router.replace("/admin/banners" as any);
    } catch (error: any) {
      console.error("Error creating banner:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || error.message || "Failed to create banner",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
    <ScrollView className="flex-1 px-4 pt-4">
      <View className="bg-white p-4 rounded-xl border border-border mb-20">
        {/* Image */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Banner Image *</Text>
        <Pressable onPress={pickImage} className="mb-4">
          {image ? (
            <Image source={{ uri: image.uri }} className="w-full h-40 rounded-lg" resizeMode="cover" />
          ) : (
            <View className="w-full h-32 rounded-lg bg-surface justify-center items-center border border-dashed border-border">
              <Ionicons name="cloud-upload-outline" size={32} color={COLORS.secondary} />
              <Text className="text-secondary text-xs mt-2">Tap to select image</Text>
            </View>
          )}
        </Pressable>

        {/* Title */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Title *</Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="e.g. Summer Sale"
          value={title}
          onChangeText={setTitle}
        />

        {/* Subtitle */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Subtitle</Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="e.g. Up to 50% off on all items"
          value={subtitle}
          onChangeText={setSubtitle}
        />

        {/* Link */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Link (optional)</Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="e.g. /shop or /product/abc123"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
        />

        {/* Order */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Display Order</Text>
        <TextInput
          className="bg-surface p-4 rounded-xl mb-4 text-primary"
          placeholder="Auto-assigned if empty"
          keyboardType="number-pad"
          value={order}
          onChangeText={setOrder}
        />

        {/* Start Date */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">Start Date</Text>
        <Pressable
          className="bg-surface p-4 rounded-xl mb-4 flex-row justify-between items-center"
          onPress={() => { setShowEndPicker(false); setShowStartPicker(true); }}
        >
          <Text className={startDate ? "text-primary" : "text-secondary"}>
            {startDate ? formatDate(startDate) : "Not set (starts immediately)"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onStartDateChange}
          />
        )}

        {/* End Date */}
        <Text className="text-secondary text-xs font-bold mb-1 uppercase">End Date</Text>
        <Pressable
          className="bg-surface p-4 rounded-xl mb-4 flex-row justify-between items-center"
          onPress={() => { setShowStartPicker(false); setShowEndPicker(true); }}
        >
          <Text className={endDate ? "text-primary" : "text-secondary"}>
            {endDate ? formatDate(endDate) : "Not set (no expiration)"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onEndDateChange}
          />
        )}

        {/* Active */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-primary font-bold">Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#eee", true: COLORS.primary }}
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`bg-primary py-4 rounded-full items-center ${submitting ? "opacity-70" : ""}`}
          style={({ pressed }) => ({ opacity: pressed && !submitting ? 0.8 : 1 })}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Banner</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
