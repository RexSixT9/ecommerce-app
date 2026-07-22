import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

const COLORS = {
  primary: "#111111",
  secondary: "#666666",
  surface: "#F7F7F7",
  accent: "#FF4C3B",
  error: "#FF4444",
  success: "#22C55E",
  info: "#3B82F6",
  background: "#FFFFFF",
};

interface CustomToastProps {
  text1?: string;
  text2?: string;
  icon?: string;
  accentColor?: string;
}

const CustomToast: React.FC<CustomToastProps> = ({
  text1,
  text2,
  icon = "checkmark-circle",
  accentColor = COLORS.success,
}) => (
  <View style={styles.container}>
    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    <View style={styles.iconContainer}>
      <Ionicons name={icon as any} size={22} color={accentColor} />
    </View>
    <View style={styles.textContainer}>
      {text1 ? <Text style={styles.text1} numberOfLines={1}>{text1}</Text> : null}
      {text2 ? <Text style={styles.text2} numberOfLines={2}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: any) => (
    <CustomToast
      {...props}
      icon="checkmark-circle"
      accentColor={COLORS.success}
    />
  ),
  error: (props: any) => (
    <CustomToast
      {...props}
      icon="close-circle"
      accentColor={COLORS.error}
    />
  ),
  info: (props: any) => (
    <CustomToast
      {...props}
      icon="information-circle"
      accentColor={COLORS.info}
    />
  ),
  warning: (props: any) => (
    <CustomToast
      {...props}
      icon="warning"
      accentColor="#F59E0B"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 50,
    paddingVertical: 12,
    paddingRight: 16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconContainer: {
    marginLeft: 14,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  text2: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
});
