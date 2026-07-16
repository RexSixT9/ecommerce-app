import { Stack } from "expo-router";
import "@/global.css";
import { CartProvider } from "src/context/CartContext";
import { WishlistProvider } from "src/context/WishlistContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <WishlistProvider>
          <Stack screenOptions={{ headerShown: false }} />;
        </WishlistProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
