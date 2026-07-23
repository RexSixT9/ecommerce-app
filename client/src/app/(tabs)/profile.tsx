import { useRouter } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "src/components/Header";
import { COLORS, PROFILE_MENU } from "src/constants";
import { useClerk } from "@clerk/expo";

export default function Profile() {
  const { user, signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Profile" showMenu />
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          !user
            ? { flex: 1, justifyContent: "center", alignItems: "center" }
            : { paddingTop: 16 }
        }
      >
        {!user ? (
          // Guest User
          <View className="items-center w-full">
            <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
              <Ionicons
                name="person-outline"
                size={40}
                color={COLORS.secondary}
              />
            </View>
            <Text className="text-xl font-bold text-center mb-2 text-primary">
              Welcome, Guest!
            </Text>
            <Text className="text-secondary text-center mb-8 text-base w-3/4 px-4">
              Please log in to access your profile and enjoy a personalized
              shopping experience.
            </Text>
            <Pressable
              className="bg-primary w-3/5 py-3 rounded-full items-center shadow-lg"
              onPress={() => router.push("/sign-in")}
            >
              <Text className="text-white font-bold text-lg">
                Log In / Sign Up
              </Text>
            </Pressable>
          </View>
        ) : (
          // Logged-in User
          <>
            <View className="items-center mb-8">
              <View className="mb-3">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="size-20 border-2 border-gray-100 rounded-full shadow-sm"
                />
              </View>
              <Text className="text-xl font-bold text-primary">
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-secondary text-sm">
                {user.emailAddresses[0].emailAddress}
              </Text>

              {/* Admin Panel */}
              {user.publicMetadata?.role === "admin" && (
                <Pressable
                  className="mt-4 bg-primary px-4 py-2 rounded-full"
                  onPress={() => router.push("/admin")}
                >
                  <Text className="text-white font-bold">Admin Panel</Text>
                </Pressable>
              )}
            </View>

            {/* Menu */}
            <View className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
              {PROFILE_MENU.map((item, index) => (
                <Pressable
                  key={item.id}
                  className={`flex-row items-center px-4 py-4 ${index !== PROFILE_MENU.length - 1 ? "border-b border-border" : ""}`}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
                >
                  <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-4">
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text className="font-medium flex-1 text-primary">
                    {item.title}
                  </Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={COLORS.secondary}
                  />
                </Pressable>
              ))}
            </View>

            {/* Logout Button */}
            <Pressable
              className="flex-row items-center justify-center py-4 rounded-xl border border-accent/30 bg-accent/5"
              onPress={handleLogout}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
              <Text className="text-accent font-bold ml-2">Logout</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
