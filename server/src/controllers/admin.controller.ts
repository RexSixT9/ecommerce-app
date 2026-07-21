import { Request, Response } from "express";

// Get dashboard statistics
// GET /api/admin/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
    });
  }
};
