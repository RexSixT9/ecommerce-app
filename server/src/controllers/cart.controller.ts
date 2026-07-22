import { Request, Response } from "express";
import { Cart } from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Get the cart of the logged-in user
// GET /api/cart
export const getUserCart = async (req: Request, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock",
    );

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

// Add an item to the cart of the logged-in user
// POST /api/cart/add
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    if (size && !product.sizes.includes(size)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid size selected" });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        size,
      });
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate("items.product", "name price images stock");
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error adding item to cart" });
  }
};

// Update the quantity of an item in the cart of the logged-in user
// PUT /api/cart/item/:productId
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found for user" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) =>
          !(item.product.toString() === productId && item.size === size),
      );
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock available" });
      }
      item.quantity = quantity;
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate("items.product", "name price images stock");
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error updating cart item" });
  }
};

// Remove an item from the cart of the logged-in user
// DELETE /api/cart/item/:productId
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found for user" });
    }

    const matchesSize = size !== undefined && size !== null && size !== "";
    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          (matchesSize ? item.size === size : item.size === undefined)
        ),
    );

    if (cart.items.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate("items.product", "name price images stock");
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error removing cart item" });
  }
};

// Clear the cart of the logged-in user
// DELETE /api/cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found for user" });
    }

    cart.items = [];
    cart.calculateTotal();
    await cart.save();

    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error clearing cart" });
  }
};
