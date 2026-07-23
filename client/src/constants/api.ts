import { create } from "axios";
import Toast from "react-native-toast-message";

const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://ecom-rn-server.vercel.app/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        Toast.show({
          type: "error",
          text1: "Session Expired",
          text2: "Please sign in again to continue.",
        });
      } else if (status === 403) {
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "You don't have permission to perform this action.",
        });
      } else if (status >= 500) {
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: "Something went wrong on our end. Please try again.",
        });
      }
    } else if (error.request) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Unable to connect to the server. Check your connection.",
      });
    }
    return Promise.reject(error);
  },
);

export default api;
