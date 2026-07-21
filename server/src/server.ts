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
import { makeAdmin } from "./scripts/makeAdmin.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
await connectDB();

app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

/* ==========================
    Middleware
========================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

/* ==========================
   Routes
========================== */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is live!",
  });
});

/* ==========================
   404 Handler
========================== */
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

// Make the user with the email in ADMIN_EMAIL an admin
await makeAdmin();

//  Local Development Only
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
