import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const adminRoutes = Router();

adminRoutes.get("/stats", protect, authorize("admin"), getDashboardStats);

export default adminRoutes;
