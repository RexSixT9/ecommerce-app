import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const ProductRouter = Router();

// Public routes
ProductRouter.get("/", getProducts);
ProductRouter.get("/:id", getProductById);

// Admin routes
ProductRouter.post(
  "/",
  upload.array("images", 5),
  protect,
  authorize("admin"),
  createProduct,
);
ProductRouter.put(
  "/:id",
  upload.array("images"),
  protect,
  authorize("admin"),
  updateProduct,
);
ProductRouter.delete("/:id", protect, authorize("admin"), deleteProduct);

export default ProductRouter;