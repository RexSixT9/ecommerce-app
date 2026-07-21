import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId: userId }).select("-password");
    req.user = user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    next();
  } catch (err) {
    console.error("Error in auth middleware:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
};
