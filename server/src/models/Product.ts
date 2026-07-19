import mongoose from "mongoose";
import { IProduct } from "../types/index.js";

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    images: [{ type: String, required: true }],
    sizes: [{ type: String }],
    category: {
      type: String,
      enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"],
      required: true,
    },
    stock: { type: Number, required: true, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
