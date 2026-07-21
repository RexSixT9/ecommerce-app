import { Router } from "express";
import {
  createAddress,
  getAddresses,
} from "../controllers/address.controller.js";

const AddressRouter = Router();

AddressRouter.get("/", getAddresses);
AddressRouter.post("/", createAddress);

export default AddressRouter;
