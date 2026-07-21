import { Request, Response } from "express";
import User from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";

// Get dashboard statistics
// GET /api/admin/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const validOrders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    const totalRevenue = validOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("items.product", "name images");


    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        recentOrders,
      },
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
    });
  }
};
