import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined");
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  await mongoose.connect(mongoURI);
};
