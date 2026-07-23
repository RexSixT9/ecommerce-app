import { Router } from "express";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../controllers/banner.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const BannerRouter = Router();

BannerRouter.get("/", (req, res, next) => {
  if (req.query.showAll === "true") {
    return protect(req, res, () => authorize("admin")(req, res, () => getBanners(req, res)));
  }
  return getBanners(req, res);
});
BannerRouter.get("/:id", protect, authorize("admin"), getBannerById);
BannerRouter.post("/", protect, authorize("admin"), upload.single("image"), createBanner);
BannerRouter.put("/:id", protect, authorize("admin"), upload.single("image"), updateBanner);
BannerRouter.delete("/:id", protect, authorize("admin"), deleteBanner);

export default BannerRouter;
