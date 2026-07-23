import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useRouter, Link } from "expo-router";
import { useSignUp } from "@clerk/expo/legacy";
import { COLORS } from "@/constants";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Sign Up",
        text2: err?.errors?.[0]?.message ?? "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Enter verification code",
      });
      return;
    }

    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        Toast.show({
          type: "error",
          text1: "Verification incomplete",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Verify",
        text2: err?.errors?.[0]?.message ?? "Invalid code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      {!pendingVerification ? (
        <>
          <Pressable
            onPress={() => router.push("/")}
            className="absolute top-12 left-6 z-10"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>

          {/* Header */}
          <View className="items-center mb-8">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-28 h-8 mb-6"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-primary mb-2">
              Create Account
            </Text>
            <Text className="text-secondary">Sign up to get started</Text>
          </View>

          {/* First Name */}
          <View className="mb-4">
            <Text className="text-primary font-medium mb-2">First Name</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="John"
              placeholderTextColor={COLORS.secondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View className="mb-6">
            <Text className="text-primary font-medium mb-2">Last Name</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="Doe"
              placeholderTextColor={COLORS.secondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-primary font-medium mb-2">Email</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="user@example.com"
              placeholderTextColor={COLORS.secondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-primary font-medium mb-2">Password</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="********"
              placeholderTextColor={COLORS.secondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit */}
          <Pressable
            className="w-full bg-primary py-4 rounded-full items-center mb-10"
            onPress={onSignUpPress}
            disabled={loading}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </Pressable>

          {/* Footer */}
          <View className="flex-row justify-center">
            <Text className="text-secondary">Already have an account? </Text>
            <Link href="/sign-in">
              <Text className="text-primary font-bold">Login</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <Pressable
            onPress={() => setPendingVerification(false)}
            className="absolute top-12 left-6 z-10"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>

          {/* Verification */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-primary mb-2">
              Verify Email
            </Text>
            <Text className="text-secondary text-center">
              Enter the code sent to your email
            </Text>
          </View>

          <View className="mb-6">
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
              placeholder="123456"
              placeholderTextColor={COLORS.secondary}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          </View>

          <Pressable
            className="w-full bg-primary py-4 rounded-full items-center"
            onPress={onVerifyPress}
            disabled={loading}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify</Text>
            )}
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}
