import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.controller.js";
import ProductRouter from "./routes/products.routes.js";
import CartRouter from "./routes/cart.routes.js";
import WishlistRouter from "./routes/wishlist.routes.js";
import OrderRouter from "./routes/order.route.js";
import AddressRouter from "./routes/address.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
await connectDB();

// Webhook route for Clerk
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

//  Routes
app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    message: "Welcome to the Root Route of the E-commerce API",
    timestamp: new Date().toISOString(),
  });
});
app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});
app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/wishlist", WishlistRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/admin", adminRoutes);

//  404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

//  Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// await makeAdmin(); // Ensure this is called after the database connection is established
// await seedProducts(process.env.MONGODB_URI as string); // Ensure this is called after the database connection is established

//  Local Development Only
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
