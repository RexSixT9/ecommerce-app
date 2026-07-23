import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants";

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
    <View style={[styles.iconCircle, { backgroundColor: accentColor + "25" }]}>
      <Ionicons name={icon as any} size={20} color={accentColor} />
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
      accentColor={COLORS.warning}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 9999,
    marginHorizontal: 16,
    marginTop: 60,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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