import { Router } from "express";
import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const WishlistRouter = Router();

WishlistRouter.get("/", protect, getWishlist);
WishlistRouter.post("/add", protect, addToWishlist);
WishlistRouter.delete("/item/:productId", protect, removeFromWishlist);
WishlistRouter.delete("/", protect, clearWishlist);

export default WishlistRouter;
