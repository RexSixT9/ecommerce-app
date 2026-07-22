import { model, Schema } from "mongoose";
import { IWishlist } from "../types/index.js";

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Wishlist = model<IWishlist>("Wishlist", WishlistSchema);
