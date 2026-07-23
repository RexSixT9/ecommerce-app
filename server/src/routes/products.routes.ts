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
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProduct,
);
ProductRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct,
);
ProductRouter.delete("/:id", protect, authorize("admin"), deleteProduct);

export default ProductRouter;
