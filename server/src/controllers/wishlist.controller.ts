import { Request, Response } from "express";
import Product from "../models/product.model.js";
import { Wishlist } from "../models/wishlist.model.js";

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return wishlist;
};

const populateWishlist = (wishlist: any) =>
  wishlist.populate("products", "name price images stock comparePrice isActive");

// Get logged-in user's wishlist
// GET /api/wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    await populateWishlist(wishlist);

    res.json({ success: true, data: wishlist });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching wishlist" });
  }
};

// Add a product to wishlist
// POST /api/wishlist/add
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);
    const alreadySaved = wishlist.products.some(
      (item) => item.toString() === productId,
    );

    if (!alreadySaved) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await populateWishlist(wishlist);

    res.json({
      success: true,
      message: alreadySaved
        ? "Product is already in wishlist"
        : "Product added to wishlist",
      data: wishlist,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error adding product to wishlist" });
  }
};

// Remove a product from wishlist
// DELETE /api/wishlist/item/:productId
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const wishlist = await getOrCreateWishlist(req.user._id);
    const initialLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId,
    );

    if (wishlist.products.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in wishlist" });
    }

    await wishlist.save();
    await populateWishlist(wishlist);

    res.json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error removing product from wishlist" });
  }
};

// Clear wishlist
// DELETE /api/wishlist
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = [];
    await wishlist.save();

    res.json({ success: true, message: "Wishlist cleared successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error clearing wishlist" });
  }
};
