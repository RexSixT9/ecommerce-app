import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const AddressRouter = Router();

AddressRouter.get("/", protect, getAddresses);
AddressRouter.post("/", protect, createAddress);
AddressRouter.put("/:id", protect, updateAddress);
AddressRouter.delete("/:id", protect, deleteAddress);

export default AddressRouter;
