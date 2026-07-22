import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const OrderRouter = Router();

OrderRouter.post("/", protect, createOrder);
OrderRouter.get("/", protect, getUserOrders);
OrderRouter.get("/admin/all", protect, authorize("admin"), getAllOrders);
OrderRouter.get("/:orderId", protect, getOrderById);
OrderRouter.put("/:orderId", protect, authorize("admin"), updateOrderStatus);

export default OrderRouter;
