import { create } from "axios";
import { Platform } from "react-native";

const LOCAL_API_URL = Platform.select({
  ios: "http://192.168.1.2:3000/api",
  android: "http://192.168.1.2:3000/api",
  default: "http://localhost:3000/api",
});

const api = create({
  baseURL: LOCAL_API_URL,
});

export default api;
