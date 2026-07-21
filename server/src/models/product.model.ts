import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/index.js";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [{ type: String, required: true }],
    sizes: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"],
      default: "Other",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
