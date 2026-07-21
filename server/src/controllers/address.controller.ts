import { Request, Response } from "express";
import { Address } from "../models/address.model.js";

// Get user's addresses
// GET /api/addresses
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      createdAt: -1,
      isDefault: -1,
    });
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve addresses",
    });
  }
};

// Create a new address
// POST /api/addresses
export const createAddress = async (req: Request, res: Response) => {
  try {
    const { street, city, state, zipCode, country, isDefault, type } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const newAddress = await Address.create({
      user: req.user._id,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
      type,
    });
    res.status(201).json({
      success: true,
      data: newAddress,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create address",
    });
  }
};

// Update an existing address
// PUT /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { street, city, state, zipCode, country, isDefault, type } = req.body;

    let addressItem = await Address.findById(id);
    if (!addressItem) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (addressItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this address",
      });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    addressItem = await Address.findByIdAndUpdate(
      id,
      {
        type,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
      },
      { new: true },
    );

    res.json({ success: true, data: addressItem });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// Delete an address
// DELETE /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this address",
      });
    }

    await address.deleteOne();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
