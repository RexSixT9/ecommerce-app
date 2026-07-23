import { Request, Response } from "express";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { IProduct } from "../types/index.js";
import { randomUUID } from "crypto";

const buildOrderNumber = () => `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;

// Get User Orders
// GET /api/orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const query = { user: req.user._id };
    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user orders" });
  }
};

// Get Order by ID
// GET /api/orders/:orderId
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "items.product",
      "name images",
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// Create Order
// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { shippingAddress, notes, paymentMethod, paymentIntentId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }
      const populatedProduct = item.product as unknown as IProduct;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        name: populatedProduct.name,
        image: populatedProduct.images?.[0],
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const subtotal = cart.totalAmount;
    const shippingCost = 2;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    const order = await Order.create({
      user: req.user._id,
      orderNumber: buildOrderNumber(),
      items: orderItems,
      totalAmount: total,
      shippingAddress,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: "pending",
      orderStatus: "placed",
      subtotal,
      shippingCost,
      tax,
      notes,
      paymentIntentId,
    });

    if (paymentMethod !== "stripe") {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

// Update Order Status
// PUT /api/orders/:orderId/status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus === "delivered") order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, data: order });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: "Error updating order status" });
  }
};

// Get All Orders (Admin)
// GET /api/orders/admin/all
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};

    if (status) query.orderStatus = status;
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit)).limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};