import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();
const clerkAuthMiddleware = process.env.CLERK_SECRET_KEY
  ? clerkMiddleware()
  : (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
      next();
    };

app.use(cors());
app.use(clerkAuthMiddleware);

// Webhooks must receive the raw request body before any JSON parser runs.
app.post("/api/webhooks", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());

app.get("/", async (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to the E-commerce API",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
  app.listen(port, async () => {
    await connectDB();
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
