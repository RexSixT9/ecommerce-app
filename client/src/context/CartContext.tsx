import { Product, WishlistContextType } from "@/constants/types";
import { dummyCart, dummyWishlist } from "assets/assets";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const fetchCartItems = async () => {
    setIsLoading(true);
    const serverCartItems = dummyCart;
    const mappedItems: CartItem[] = serverCartItems.items.map((item: any) => ({
      id: item.product._id,
      productId: item.product._id,
      product: item.product,
      quantity: item.quantity,
      size: item.size,
      price: item.price,
    }));
    setCartItems(mappedItems);
    setCartTotal(serverCartItems.totalAmount);
    setIsLoading(false);
  };

  const addToCart = async (
    product: Product,
    size: string,
  ) => {
    setIsLoading(true);
    const existingItem = cartItems.find(
      (item) => item.productId === product._id && item.size === size,
    );
    setIsLoading(false);
  };

  const removeFromCart = async (productId: string, size: string) => {
    setIsLoading(true);
    setCartItems(prevItems => prevItems.filter(item => !(item.productId === productId && item.size === size)));
    setIsLoading(false);
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    size: string = 'M',
  ) => {
    setIsLoading(true);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
    setIsLoading(false);
  };

  const clearCart = async () => {
    setIsLoading(true);
    setCartItems([]);
    setIsLoading(false);
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCartItems();
  }, []);

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
