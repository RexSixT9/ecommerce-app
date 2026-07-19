import mongoose from "mongoose";

let cached: typeof mongoose | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached) {
    return cached;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined");
  }

  const conn = await mongoose.connect(mongoURI);

  cached = conn;

  return conn;
};
