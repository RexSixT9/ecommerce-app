import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const WishlistRouter = Router();

WishlistRouter.get("/", protect, getWishlist);
WishlistRouter.post("/add", protect, addToWishlist);
WishlistRouter.delete("/item/:productId", protect, removeFromWishlist);

export default WishlistRouter;
