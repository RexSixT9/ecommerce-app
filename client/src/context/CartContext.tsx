import { Product } from "@/constants/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";
import Toast from "react-native-toast-message";

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    size: string,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cartTotal, setCartTotal] = useState<number>(0);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success && data.data) {
        const serverCart = data.data;
        const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
          id: item._id,
          productId: item.product._id,
          product: item.product,
          quantity: item.quantity,
          size: item?.size || "M",
          price: item.price,
        }));
        setCartItems(mappedItems);
        setCartTotal(serverCart.totalAmount);
      }
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please Sign In",
        text2: "You need to be signed in to add items to the cart.",
      });
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        await fetchCartItems();
        Toast.show({
          type: "success",
          text1: "Added to Cart",
          text2: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Add to Cart",
        text2: "Something went wrong while adding the product to the cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please Sign In",
        text2: "You need to be signed in to remove items from the cart.",
      });
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete(
        `/cart/item/${productId}?size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            productId,
            size,
          },
        },
      );
      if (data.success) {
        await fetchCartItems();
        Toast.show({
          type: "success",
          text1: "Removed from Cart",
          text2: "Item has been removed from your cart.",
        });
      }
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Remove from Cart",
        text2: "Something went wrong while removing the product from the cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    size: string = "M",
  ) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please Sign In",
        text2:
          "You need to be signed in to update item quantities in the cart.",
      });
    }
    if (quantity < 1) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.put(
        `/cart/item/${productId}`,
        {
          quantity,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (data.success) {
        await fetchCartItems();
        Toast.show({
          type: "success",
          text1: "Quantity Updated",
          text2: "Item quantity has been updated in your cart.",
        });
      }
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Update Quantity",
        text2: "Something went wrong while updating the item quantity.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please Sign In",
        text2: "You need to be signed in to clear the cart.",
      });
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setCartItems([]);
        setCartTotal(0);
        Toast.show({
          type: "success",
          text1: "Cart Cleared",
          text2: "All items have been removed from your cart.",
        });
      }
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Clear Cart",
        text2: "Something went wrong while clearing the cart.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (isSignedIn) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [isSignedIn]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
