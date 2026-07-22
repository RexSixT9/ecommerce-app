import { Router } from "express";
import { addItemToCart, clearCart, getUserCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const CartRouter = Router();

CartRouter.get("/", protect, getUserCart);
CartRouter.post("/add", protect, addItemToCart);
CartRouter.put("/item/:productId", protect, updateCartItem);
CartRouter.delete("/item/:productId", protect, removeCartItem);
CartRouter.delete("/", protect, clearCart);

export default CartRouter;