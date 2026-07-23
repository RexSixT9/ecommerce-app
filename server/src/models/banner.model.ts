import mongoose, { Schema } from "mongoose";
import { IBanner } from "../types/index.js";

const bannerSchema = new Schema<IBanner>(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Banner = mongoose.model<IBanner>("Banner", bannerSchema);

export default Banner;
