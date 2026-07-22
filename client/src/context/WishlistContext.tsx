import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import api from "src/constants/api";
import Toast from "react-native-toast-message";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success && data.data) {
        setWishlist(data.data.products);
      }
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please Sign In",
        text2: "You need to be signed in to manage your wishlist.",
      });
    }

    const exists = wishlist.some((item) => item._id === product._id);

    try {
      setLoading(true);
      const token = await getToken();

      if (exists) {
        const { data } = await api.delete(`/wishlist/item/${product._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.success) {
          await fetchWishlist();
          Toast.show({
            type: "success",
            text1: "Removed from Wishlist",
            text2: `${product.name} has been removed from your wishlist.`,
          });
        }
      } else {
        const { data } = await api.post(
          "/wishlist/add",
          { productId: product._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (data.success) {
          await fetchWishlist();
          Toast.show({
            type: "success",
            text1: "Added to Wishlist",
            text2: `${product.name} has been added to your wishlist.`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Wishlist Update Failed",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item._id === productId);
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isSignedIn]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, isInWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
